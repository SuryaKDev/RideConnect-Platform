package com.rideconnect.backend.controller;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    // 1. Get All Users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. Get All Bookings
    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // 3. Verify a Driver
    @PutMapping("/verify-driver/{id}")
    public ResponseEntity<?> verifyDriver(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setVerified(true);
            userRepository.save(user);
            // FIX: Return JSON instead of String
            return ResponseEntity.ok(Map.of("message", "User verified successfully: " + user.getName()));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. Block a User
    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(false);
            userRepository.save(user);
            // FIX: Return JSON instead of String
            return ResponseEntity.ok(Map.of("message", "User blocked successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. Cancel a Ride
    @PutMapping("/rides/{id}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable Long id) {
        return rideRepository.findById(id).map(ride -> {
            ride.setStatus("CANCELLED_BY_ADMIN");
            rideRepository.save(ride);
            // FIX: Return JSON instead of String
            return ResponseEntity.ok(Map.of("message", "Ride cancelled successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }
}