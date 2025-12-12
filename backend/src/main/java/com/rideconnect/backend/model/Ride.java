package com.rideconnect.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    // NEW: Comma-separated list of cities (e.g., "Ambur, Vellore")
    private String stopovers;

    @Column(nullable = false)
    private LocalDate travelDate;

    @Column(nullable = false)
    private LocalTime travelTime;

    @Column(nullable = false)
    private Double pricePerSeat;

    @Column(nullable = false)
    private Integer availableSeats;

    private String status;

    private Double distanceKm;

    // Store why it was cancelled
    private String cancellationReason;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "authorities"})
    private User driver;
}