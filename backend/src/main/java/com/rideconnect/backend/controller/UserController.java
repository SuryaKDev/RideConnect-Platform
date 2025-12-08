package com.rideconnect.backend.controller;

import com.rideconnect.backend.dto.UpdateProfileRequest;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Endpoint: GET /api/users/profile
    // Used to populate the "Edit Profile" form with current data
    @GetMapping("/profile")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    // Endpoint: PUT /api/users/profile
    // Handles the update logic
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // Pass the username (email) from the token to ensure users update their own profile
            User updatedUser = userService.updateProfile(userDetails.getUsername(), request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}