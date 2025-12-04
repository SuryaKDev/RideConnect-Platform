package com.rideconnect.backend.config;

import com.rideconnect.backend.model.Role;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if Admin exists. If not, create one.
        if (!userRepository.existsByEmail("admin@rideconnect.com")) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@rideconnect.com")
                    .password(passwordEncoder.encode("admin123")) // Default Password
                    .phone("0000000000")
                    .role(Role.ADMIN)
                    .isVerified(true)
                    .isActive(true)
                    .build();
            
            userRepository.save(admin);
            System.out.println("✅ SUPER ADMIN CREATED: admin@rideconnect.com / admin123");
        }
    }
}