package com.rideconnect.backend.repository;

import com.rideconnect.backend.model.Ride;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    // We will add search methods here later (e.g., findBySourceAndDestination)
    List<Ride> findBySourceAndDestinationAndTravelDate(String source, String destination, LocalDate travelDate);
}