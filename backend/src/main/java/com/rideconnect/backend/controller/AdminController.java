package com.rideconnect.backend.controller;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository; // Inject RideRepository

    // 1. Get All Users (Drivers & Passengers)
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. Get All Bookings (System wide)
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
            return ResponseEntity.ok("User verified successfully: " + user.getName());
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 4. Delete a User (Fraudulent/Spam)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    // 5. Block a Fraudulent User
    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(false); // Disable login
            userRepository.save(user);
            return ResponseEntity.ok("User blocked successfully. They cannot login anymore.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // 6. Cancel a Ride (Emergency/Violation)
    @PutMapping("/rides/{id}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable Long id) {
        return rideRepository.findById(id).map(ride -> {
            ride.setStatus("CANCELLED_BY_ADMIN");
            rideRepository.save(ride);
            return ResponseEntity.ok("Ride cancelled successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }
}