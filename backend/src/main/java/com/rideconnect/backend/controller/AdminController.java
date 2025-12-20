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

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @PutMapping("/verify-driver/{id}")
    public ResponseEntity<?> verifyDriver(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setVerified(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User verified successfully: " + user.getName()));
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(false);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User blocked successfully."));
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PutMapping("/rides/{id}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        return rideRepository.findById(id).map(ride -> {
            ride.setStatus("CANCELLED_BY_ADMIN");
            ride.setCancellationReason(reason != null ? reason : "Violation of terms");
            rideRepository.save(ride);
            return ResponseEntity.ok(Map.of("message", "Ride cancelled successfully. Reason logged."));
        }).orElseThrow(() -> new RuntimeException("Ride not found"));
    }
}