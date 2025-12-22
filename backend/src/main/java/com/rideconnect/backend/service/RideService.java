package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.PassengerDto;
import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.repository.spec.RideSpecification;
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

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DistanceService distanceService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    private static final double BASE_FARE = 50.0;
    private static final double RATE_PER_KM = 5.0;

    public Ride postRide(Ride ride, String email) {
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!driver.isDriver()) {
            throw new RuntimeException("Only drivers can post rides!");
        }

        // VALIDATION: Cannot post rides in the past
        LocalDate today = LocalDate.now();
        if (ride.getTravelDate().isBefore(today)) {
            throw new RuntimeException("Travel date cannot be in the past!");
        }
        // Strict check: if date is today, time must be future
        if (ride.getTravelDate().equals(today) && ride.getTravelTime().isBefore(LocalTime.now())) {
            throw new RuntimeException("Travel time cannot be in the past!");
        }

        double distance = distanceService.calculateDistance(ride.getSource(), ride.getDestination());
        ride.setDistanceKm(distance);

        if (ride.getPricePerSeat() == null || ride.getPricePerSeat() == 0) {
            double calculatedFare = BASE_FARE + (distance * RATE_PER_KM);
            ride.setPricePerSeat((double) Math.round(calculatedFare / 10) * 10);
        }

        ride.setDriver(driver);
        ride.setStatus("AVAILABLE");

        return rideRepository.save(ride);
    }

    public List<Ride> getAllRides() { return rideRepository.findAll(); }
    public List<Ride> getMyRides(String email) { return rideRepository.findByDriverEmail(email); }

    public List<Ride> searchRides(String source, String destination, LocalDate date,
                                  Double minPrice, Double maxPrice,
                                  Integer minSeats, Double minRating) {

        Specification<Ride> spec = Specification.where(RideSpecification.hasStatus("AVAILABLE"));

        if (source != null && !source.isEmpty())
            spec = spec.and(RideSpecification.hasSource(source));

        if (destination != null && !destination.isEmpty())
            spec = spec.and(RideSpecification.hasDestination(destination));

        if (date != null)
            spec = spec.and(RideSpecification.hasDate(date));

        if (minPrice != null || maxPrice != null)
            spec = spec.and(RideSpecification.priceBetween(minPrice, maxPrice));

        if (minSeats != null)
            spec = spec.and(RideSpecification.minSeats(minSeats));

        return rideRepository.findAll(spec);
    }

    @Transactional
    public void cancelRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized to cancel this ride");
        }

        // 1. Mark Ride Cancelled
        ride.setStatus("CANCELLED");
        rideRepository.save(ride);

        // 2. Process All Bookings
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking b : bookings) {
            if (!b.getStatus().contains("CANCELLED")) {

                // REFUND if they paid
                if ("CONFIRMED".equals(b.getStatus())) {
                    paymentService.processRefund(b.getId());
                }

                b.setStatus("CANCELLED_BY_DRIVER");
                bookingRepository.save(b);

                // 🔔 NOTIFY PASSENGER
                notificationService.notifyUser(b.getPassenger().getEmail(), "Ride Cancelled",
                        "The driver has cancelled the ride to " + ride.getDestination() + ". Refund initiated.", "WARNING");
            }
        }
    }

    public List<PassengerDto> getPassengersForRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!ride.getDriver().getEmail().equals(driverEmail)) throw new RuntimeException("Not authorized to view bookings for this ride");
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        List<PassengerDto> passengerList = new ArrayList<>();
        for (Booking b : bookings) {
            if (!b.getStatus().equals("CANCELLED")) {
                User p = b.getPassenger();
                PassengerDto dto = PassengerDto.builder()
                        .name(p.getName()).phone(p.getPhone()).email(p.getEmail())
                        .seatsBooked(b.getSeatsBooked()).bookingStatus(b.getStatus())
                        .build();
                passengerList.add(dto);
            }
        }
        return passengerList;
    }
}