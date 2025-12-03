package com.rideconnect.backend.repository;

import com.rideconnect.backend.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    // We will add search methods here later (e.g., findBySourceAndDestination)
}