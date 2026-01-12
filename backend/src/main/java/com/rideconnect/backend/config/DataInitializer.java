package com.rideconnect.backend.config;

import com.rideconnect.backend.model.Role;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.name}")
    private String adminName;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Check if Admin exists. If not, create one.
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword)) // Default Password
                    .phone("0000000000")
                    .role(Role.ADMIN)
                    .isVerified(true)
                    .isEmailVerified(true)
                    .isActive(true)
                    .memberSince("December 2025")
                    .build();
            
            userRepository.save(admin);
            System.out.println("✅ SUPER ADMIN CREATED: admin@rideconnect.com / admin123");
        }
    }
}