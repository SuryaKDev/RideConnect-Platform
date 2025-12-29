package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.LoginRequest;
import com.rideconnect.backend.dto.UpdateProfileRequest;
import com.rideconnect.backend.model.Role;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
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

        // 4. Set default verification status
        if (user.getRole() == Role.DRIVER) {
            user.setVerified(false);
        } else {
            user.setVerified(true);
        }

        return userRepository.save(user);
    }

    public Map<String, Object> loginUser(LoginRequest loginRequest) {
        // 1. Attempt Authentication (Checks password)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // 2. Fetch the User Entity to get Name and ID
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Generate Token WITH Name and ID included
        String token = jwtUtil.generateToken(user.getEmail(), user.getName(), user.getId());

        // 4. Extract Role
        String role = user.getRole().name();

        // 5. Construct Response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("name", user.getName());
        response.put("isVerified", user.isVerified());


        return response;
    }

    // Helper method to find a user
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // PROFILE UPDATE ---
    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);

        // 1. Basic Details
        if (request.getName() != null && !request.getName().isEmpty()) user.setName(request.getName());
        if (request.getPhone() != null && !request.getPhone().isEmpty()) user.setPhone(request.getPhone());

        // 2. New Profile Fields
        if (request.getProfilePictureUrl() != null) user.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getBio() != null) user.setBio(request.getBio());

        // 3. Password
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty()) {
                throw new RuntimeException("Current password is required to set a new password.");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Incorrect current password.");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        // 4. Driver Details
        if (user.getRole() == Role.DRIVER) {
            if (request.getVehicleModel() != null && !request.getVehicleModel().isEmpty())
                user.setVehicleModel(request.getVehicleModel());
            if (request.getLicensePlate() != null && !request.getLicensePlate().isEmpty())
                user.setLicensePlate(request.getLicensePlate());
            if (request.getVehicleCapacity() != null)
                user.setVehicleCapacity(request.getVehicleCapacity());

            // New Driver Fields
            if (request.getCarImageUrl() != null) user.setCarImageUrl(request.getCarImageUrl());
            if (request.getCarFeatures() != null) user.setCarFeatures(request.getCarFeatures());
        }

        return userRepository.save(user);
    }
}