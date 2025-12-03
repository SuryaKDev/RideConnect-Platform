package com.rideconnect.backend.model;

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

    // Route Details
    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    // Timing
    @Column(nullable = false)
    private LocalDate travelDate;

    @Column(nullable = false)
    private LocalTime travelTime;

    // Ride Details
    @Column(nullable = false)
    private Double pricePerSeat;

    @Column(nullable = false)
    private Integer availableSeats;
    
    // Status (e.g., AVAILABLE, FULL, COMPLETED)
    private String status;

    // The Driver (Many Rides can belong to One Driver)
    @ManyToOne(fetch = FetchType.EAGER) // EAGER so we get driver details when searching rides
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;
}