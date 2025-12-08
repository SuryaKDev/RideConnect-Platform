package com.rideconnect.backend.service;

import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DistanceService distanceService;

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

    public List<Ride> searchRides(String source, String destination, LocalDate date) {
        return rideRepository.findBySourceAndDestinationAndTravelDate(source, destination, date);
    }
}