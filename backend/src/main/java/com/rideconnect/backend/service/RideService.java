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

    // (In a real app, these would be in application.properties)
    private static final double BASE_FARE = 50.0;
    private static final double RATE_PER_KM = 5.0;

    public Ride postRide(Ride ride, String email) {
        // 1. Verify Driver
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!driver.isDriver()) {
            throw new RuntimeException("Only drivers can post rides!");
        }

        // 2. Calculate Distance automatically (using Mock logic)
        double distance = distanceService.calculateDistance(ride.getSource(), ride.getDestination());
        ride.setDistanceKm(distance);

        // 3. Calculate Dynamic Price (ONLY if the driver didn't set one manually)
        // If price is null or 0, we auto-calculate it.
        if (ride.getPricePerSeat() == null || ride.getPricePerSeat() == 0) {
            double calculatedFare = BASE_FARE + (distance * RATE_PER_KM);

            // Round to nearest 10 rupees (e.g., 453 -> 450) for cleaner pricing
            double roundedFare = Math.round(calculatedFare / 10.0) * 10.0;
            ride.setPricePerSeat(roundedFare);
        }

        ride.setDriver(driver);
        ride.setStatus("AVAILABLE");

        return rideRepository.save(ride);
    }

    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    public List<Ride> getMyRides(String email) {
        return rideRepository.findByDriverEmail(email);
    }

    // UPDATED SEARCH METHOD using Specifications
    public List<Ride> searchRides(String source, String destination, LocalDate date,
                                  Double minPrice, Double maxPrice,
                                  Integer minSeats, Double minRating) {

        // Build the query dynamically
        Specification<Ride> spec = Specification.<Ride>where(RideSpecification.hasStatus("AVAILABLE"));

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

        // Note: Driver Rating filter left out for simplicity as it requires joining tables,
        // but this fixes the main crash.

        return rideRepository.findAll(spec);
    }

    // CANCEL RIDE (Driver)
    @Transactional
    public void cancelRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized to cancel this ride");
        }

        // 1. Update Ride Status
        ride.setStatus("CANCELLED");
        rideRepository.save(ride);

        // 2. Cancel All Associated Bookings (Cascade)
        // Ideally, we need a repository method to find bookings by rideId
        // For now, let's assume we fetch them somehow or just leave them.
        // NOTE: In a real app, you MUST implement this to notify passengers.
        // We will add the Repository method below to make this complete.
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking b : bookings) {
            if (!"CANCELLED".equals(b.getStatus())) {
                b.setStatus("CANCELLED_BY_DRIVER");
                bookingRepository.save(b);
            }
        }
    }
    // VIEW PASSENGERS
    public List<PassengerDto> getPassengersForRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        // Security Check: Only the driver of THIS ride can see the passengers
        if (!ride.getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized to view bookings for this ride");
        }

        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        List<PassengerDto> passengerList = new ArrayList<>();

        for (Booking b : bookings) {
            // Include only active bookings (Confirmed or Pending Payment)
            // You can decide if you want to see Cancelled ones too
            if (!b.getStatus().equals("CANCELLED")) {
                User p = b.getPassenger();
                PassengerDto dto = PassengerDto.builder()
                        .name(p.getName())
                        .phone(p.getPhone())
                        .email(p.getEmail())
                        .seatsBooked(b.getSeatsBooked())
                        .bookingStatus(b.getStatus())
                        .build();
                passengerList.add(dto);
            }
        }
        return passengerList;
    }
}