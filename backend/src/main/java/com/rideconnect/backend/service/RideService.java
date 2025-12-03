package com.rideconnect.backend.service;

import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    public Ride postRide(Ride ride, String email) {
        // 1. Get the driver from the database using the email (from JWT)
        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check if the user is actually a driver
        if (!driver.isDriver()) {
            throw new RuntimeException("Only drivers can post rides!");
        }

        // 3. Assign the driver to the ride & set status
        ride.setDriver(driver);
        ride.setStatus("AVAILABLE");

        // 4. Save the ride
        return rideRepository.save(ride);
    }
    
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }
}