package com.rideconnect.backend.service;

import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        // 1. Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use: " + user.getEmail());
        }

        // 2. Encrypt the password (Never store plain text!)
        // This fulfills the requirement: "Password encryption with BCrypt/Argon2" 
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 3. Save to database
        return userRepository.save(user);
    }
    
    // Helper method to find a user (we will need this for Login later)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}