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
import java.util.Map;

@Service
public class RideService {

    @Autowired private RideRepository rideRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DistanceService distanceService;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private PaymentService paymentService;
    @Autowired private NotificationService notificationService;
    @Autowired private GoogleMapsService googleMapsService;
    @Autowired private EmailService emailService;

    private static final double BASE_FARE = 50.0;
    private static final double RATE_PER_KM = 5.0;

    public Map<String, Object> calculateRideDetails(String source, String destination) {
        // Use optimized service to get distance
        Map<String, Object> routeData = googleMapsService.getRouteDetails(source, destination);

        Double distance = 0.0;
        if (routeData != null && routeData.containsKey("distance")) {
            distance = (Double) routeData.get("distance");
        } else {
            // Fallback to Mock if Google Fails
            distance = distanceService.calculateDistance(source, destination);
        }

        double maxFare = Math.round((BASE_FARE + (distance * RATE_PER_KM)) / 10) * 10;

        return Map.of(
                "distanceKm", distance,
                "suggestedFare", maxFare,
                "duration", "Approx " + (int)(distance / 60) + " hrs" // Simple estimation
        );
    }

    public Ride postRide(Ride ride, String email) {
        User driver = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!driver.isEmailVerified()) throw new RuntimeException("Please verify your email before posting a ride.");
        if (!driver.isDriver()) throw new RuntimeException("Only drivers can post rides!");

        LocalDate today = LocalDate.now();
        if (ride.getTravelDate().isBefore(today)) throw new RuntimeException("Travel date cannot be in the past!");

        // 1. Geocoding (Coordinates)
        LatLng srcCoords = googleMapsService.getCoordinates(ride.getSource());
        LatLng destCoords = googleMapsService.getCoordinates(ride.getDestination());
        // if (srcCoords != null) ride.setSourceLocation(GeometryUtil.createPoint(srcCoords.lat, srcCoords.lng));
        // if (destCoords != null) ride.setDestinationLocation(GeometryUtil.createPoint(destCoords.lat, destCoords.lng));

        // 2. OPTIMIZED: Get Route & Distance in ONE call
        Map<String, Object> routeData = googleMapsService.getRouteDetails(ride.getSource(), ride.getDestination());
        Double distance = 0.0;

        if (routeData != null) {
            if (routeData.containsKey("path")) {
                // ride.setRoutePath(GeometryUtil.createLineString((List<LatLng>) routeData.get("path")));
            }
            if (routeData.containsKey("distance")) {
                distance = (Double) routeData.get("distance");
            }
        }

        // Fallback Distance
        if (distance == 0.0) distance = distanceService.calculateDistance(ride.getSource(), ride.getDestination());
        ride.setDistanceKm(distance);

        // 3. Price Validation & Logic
        double maxFare = Math.round((BASE_FARE + (distance * RATE_PER_KM)) / 10) * 10;

        if (ride.getPricePerSeat() != null && ride.getPricePerSeat() > 0) {
            // User provided a price. VALIDATE IT.
            if (ride.getPricePerSeat() > maxFare) {
                throw new RuntimeException("Price cannot exceed the maximum calculated fare of ₹" + maxFare);
            }
        } else {
            // Default to max/dynamic fare
            ride.setPricePerSeat(maxFare);
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
    public void cancelRide(Long rideId, String driverEmail, String reason, boolean isAdmin) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        
        if (!isAdmin && !ride.getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized");
        }

        ride.setStatus(isAdmin ? "CANCELLED_BY_ADMIN" : "CANCELLED");
        if (reason != null) {
            ride.setCancellationReason(reason);
        }
        rideRepository.save(ride);

        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking b : bookings) {
            if (!b.getStatus().contains("CANCELLED")) {
                if ("CONFIRMED".equals(b.getStatus())) paymentService.processRefund(b.getId());
                b.setStatus(isAdmin ? "CANCELLED_BY_ADMIN" : "CANCELLED_BY_DRIVER");
                bookingRepository.save(b);

                emailService.sendRideCancellation(
                        b.getPassenger().getEmail(),
                        b.getPassenger().getName(),
                        ride.getSource(),
                        ride.getDestination()
                );

                String msg = isAdmin ? "Ride cancelled by admin: " + reason : "Ride cancelled by driver. Refund initiated.";
                notificationService.notifyUser(b.getPassenger().getEmail(), "Ride Cancelled", msg, "WARNING");
            }
        }
    }

    @Transactional
    public void cancelRide(Long rideId, String driverEmail) {
        cancelRide(rideId, driverEmail, null, false);
    }

    @Transactional
    public void startRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized to start this ride");
        }

        // Only allow starting if status is valid
        if (!"AVAILABLE".equals(ride.getStatus()) && !"FULL".equals(ride.getStatus())) {
            throw new RuntimeException("Ride cannot be started. Current status: " + ride.getStatus());
        }

        ride.setStatus("IN_PROGRESS");
        rideRepository.save(ride);

        // Notify Passengers
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking b : bookings) {
            if ("CONFIRMED".equals(b.getStatus())) {
                notificationService.notifyUser(b.getPassenger().getEmail(), "Ride Started",
                        "Your driver has started the trip!", "INFO");
            }
        }
    }

    @Transactional
    public void completeRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized to complete this ride");
        }

        if ("COMPLETED".equals(ride.getStatus())) {
            throw new RuntimeException("Ride is already completed");
        }

        ride.setStatus("COMPLETED");
        rideRepository.save(ride);

        // Notify Passengers
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking b : bookings) {
            if ("CONFIRMED".equals(b.getStatus())) {
                notificationService.notifyUser(b.getPassenger().getEmail(), "Ride Completed",
                        "You have reached your destination. Please rate your driver!", "SUCCESS");

                emailService.sendReviewRequest(
                        b.getPassenger().getEmail(),
                        b.getPassenger().getName(),
                        ride.getDriver().getName()
                );
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
                        .userId(p.getId())
                        .profilePictureUrl(p.getProfilePictureUrl())
                        .bio(p.getBio())
                        .build());
            }
        }
        return list;
    }
}