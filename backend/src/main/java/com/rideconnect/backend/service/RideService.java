package com.rideconnect.backend.service;

import com.google.maps.model.LatLng;
import com.rideconnect.backend.dto.PassengerDto;
import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.repository.spec.RideSpecification;
import com.rideconnect.backend.service.impl.GoogleMapsService;
import com.rideconnect.backend.util.GeometryUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RideService {

    @Autowired private RideRepository rideRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DistanceService distanceService;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private PaymentService paymentService;
    @Autowired private NotificationService notificationService;
    @Autowired private GoogleMapsService googleMapsService;

    private static final double BASE_FARE = 50.0;
    private static final double RATE_PER_KM = 5.0;

    public Ride postRide(Ride ride, String email) {
        User driver = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!driver.isDriver()) throw new RuntimeException("Only drivers can post rides!");

        LocalDate today = LocalDate.now();
        if (ride.getTravelDate().isBefore(today)) throw new RuntimeException("Travel date cannot be in the past!");

        // 1. Get Coordinates
        LatLng srcCoords = googleMapsService.getCoordinates(ride.getSource());
        LatLng destCoords = googleMapsService.getCoordinates(ride.getDestination());
        if (srcCoords != null) ride.setSourceLocation(GeometryUtil.createPoint(srcCoords.lat, srcCoords.lng));
        if (destCoords != null) ride.setDestinationLocation(GeometryUtil.createPoint(destCoords.lat, destCoords.lng));

        // 2. Get Route Path
        List<LatLng> pathPoints = googleMapsService.getRoutePoints(ride.getSource(), ride.getDestination());
        if (pathPoints != null && !pathPoints.isEmpty()) {
            ride.setRoutePath(GeometryUtil.createLineString(pathPoints));
        }

        // 3. Distance & Price
        Double dist = googleMapsService.getDistanceInKm(ride.getSource(), ride.getDestination());
        if (dist == null) dist = distanceService.calculateDistance(ride.getSource(), ride.getDestination());
        ride.setDistanceKm(dist);

        // Allow manual price override if provided
        if (ride.getPricePerSeat() == null || ride.getPricePerSeat() == 0) {
            ride.setPricePerSeat((double) Math.round((BASE_FARE + (dist * RATE_PER_KM)) / 10) * 10);
        }

        ride.setDriver(driver);
        ride.setStatus("AVAILABLE");
        return rideRepository.save(ride);
    }

    public List<Ride> getAllRides() { return rideRepository.findAll(); }
    public List<Ride> getMyRides(String email) { return rideRepository.findByDriverEmail(email); }

    // --- UPDATED SEARCH METHOD ---
    public List<Ride> searchRides(String source, String destination, LocalDate date,
                                  Double minPrice, Double maxPrice,
                                  Integer minSeats, Double minRating) {

        // 1. If NO filters are provided, return ALL Available rides (Browse Mode)
        if ((source == null || source.isEmpty()) &&
                (destination == null || destination.isEmpty()) &&
                date == null) {
            return rideRepository.findAll(Specification.where(RideSpecification.hasStatus("AVAILABLE")));
        }

        // 2. Build Specification for Text Search
        Specification<Ride> spec = Specification.where(RideSpecification.hasStatus("AVAILABLE"));
        if (source != null && !source.isEmpty()) spec = spec.and(RideSpecification.hasSource(source));
        if (destination != null && !destination.isEmpty()) spec = spec.and(RideSpecification.hasDestination(destination));
        if (date != null) spec = spec.and(RideSpecification.hasDate(date));
        if (minPrice != null) spec = spec.and(RideSpecification.priceBetween(minPrice, maxPrice));
        if (minSeats != null) spec = spec.and(RideSpecification.minSeats(minSeats));

        List<Ride> textResults = rideRepository.findAll(spec);

        // 3. Fallback to Spatial Search
        if (textResults.isEmpty() && source != null && destination != null) {
            try {
                LatLng start = googleMapsService.getCoordinates(source);
                LatLng end = googleMapsService.getCoordinates(destination);

                if (start != null && end != null) {
                    return rideRepository.findSmartRouteMatches(
                            date, start.lat, start.lng, end.lat, end.lng
                    );
                }
            } catch (Exception e) {
                System.err.println("Spatial Search Error: " + e.getMessage());
            }
        }

        return textResults;
    }

    @Transactional
    public void cancelRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!ride.getDriver().getEmail().equals(driverEmail)) throw new RuntimeException("Not authorized");
        ride.setStatus("CANCELLED");
        rideRepository.save(ride);
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking b : bookings) {
            if (!b.getStatus().contains("CANCELLED")) {
                if ("CONFIRMED".equals(b.getStatus())) paymentService.processRefund(b.getId());
                b.setStatus("CANCELLED_BY_DRIVER");
                bookingRepository.save(b);
                notificationService.notifyUser(b.getPassenger().getEmail(), "Ride Cancelled", "Ride cancelled by driver. Refund initiated.", "WARNING");
            }
        }
    }

    public List<PassengerDto> getPassengersForRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!ride.getDriver().getEmail().equals(driverEmail)) throw new RuntimeException("Not authorized");

        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        List<PassengerDto> list = new ArrayList<>();
        for (Booking b : bookings) {
            if (!b.getStatus().equals("CANCELLED")) {
                User p = b.getPassenger();
                list.add(PassengerDto.builder()
                        .bookingId(b.getId()) // Added ID here
                        .name(p.getName())
                        .phone(p.getPhone())
                        .email(p.getEmail())
                        .seatsBooked(b.getSeatsBooked())
                        .bookingStatus(b.getStatus())
                        .build());
            }
        }
        return list;
    }
}