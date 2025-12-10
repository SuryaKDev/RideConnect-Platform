package com.rideconnect.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Core Profile Details
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password; // Will be encrypted later

    @Column(nullable = false)
    private String phone;
    
    // Role: Defines if they are a Driver or Passenger
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- Driver Specific Details (Nullable for Passengers) ---
    private String vehicleModel;

    private String licensePlate;

    private Integer vehicleCapacity; // e.g., 4 seats

    @Column(nullable = false)
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(nullable = false)
    private boolean isVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    // Helper method to check if user is a driver
    public boolean isDriver() {
        return this.role == Role.DRIVER;
    }
}