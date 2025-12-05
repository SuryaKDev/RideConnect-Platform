package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.LoginRequest;
import com.rideconnect.backend.model.Role;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Lazy AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

public User registerUser(User user) {
        // 1. Check if email exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use: " + user.getEmail());
        }

        // 2. SECURITY CHECK: Prevent public Admin registration
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot register as Admin publicly!");
        }

        // 3. Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 4. Set default verification status (Drivers are not verified by default)
        if (user.getRole() == Role.DRIVER) {
            user.setVerified(false); 
        } else {
            user.setVerified(true); // Passengers don't need verification
        }

        return userRepository.save(user);
    }

    public Map<String, String> loginUser(LoginRequest loginRequest) {
        // 1. Attempt Authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // 2. Generate Token
        String token = jwtUtil.generateToken(loginRequest.getEmail());

        // 3. Return Token inside a Map
        return Collections.singletonMap("token", token);
    }
    
    // Helper method to find a user (we will need this for Login later)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}