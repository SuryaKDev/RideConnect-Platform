package com.rideconnect.backend.repository;

import com.rideconnect.backend.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long>, JpaSpecificationExecutor<Ride> {

    List<Ride> findByDriverEmail(String email);

    // --- LEVEL 3: SMART SPATIAL MATCHING ---
    // UPDATES:
    // 1. Buffer increased to 20,000 meters (20km) to catch cities like Hosur.
    // 2. Date is now optional (cast(:date as date) IS NULL OR ...)
    @Query(value = """
        SELECT * FROM rides r 
        WHERE r.status = 'AVAILABLE' 
        AND (cast(:date as date) IS NULL OR r.travel_date = :date)
        AND r.route_path IS NOT NULL
        -- Cast to geography for Meters. Buffer increased to 20km.
        AND ST_DWithin(r.route_path::geography, ST_SetSRID(ST_MakePoint(:startLng, :startLat), 4326)::geography, 20000) 
        AND ST_DWithin(r.route_path::geography, ST_SetSRID(ST_MakePoint(:endLng, :endLat), 4326)::geography, 20000)
        -- Direction check
        AND ST_LineLocatePoint(r.route_path, ST_SetSRID(ST_MakePoint(:startLng, :startLat), 4326)) < 
            ST_LineLocatePoint(r.route_path, ST_SetSRID(ST_MakePoint(:endLng, :endLat), 4326))
        """, nativeQuery = true)
    List<Ride> findSmartRouteMatches(
            @Param("date") LocalDate date,
            @Param("startLat") double startLat,
            @Param("startLng") double startLng,
            @Param("endLat") double endLat,
            @Param("endLng") double endLng
    );
}