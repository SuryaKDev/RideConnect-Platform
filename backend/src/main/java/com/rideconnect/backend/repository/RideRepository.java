package com.rideconnect.backend.repository;

import com.rideconnect.backend.model.Ride;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long>, JpaSpecificationExecutor<Ride> {

    List<Ride> findBySourceAndDestinationAndTravelDate(String source, String destination, LocalDate travelDate);

    List<Ride> findByDriverEmail(String email);

    // --- SMART ROUTE MATCHING ---
    // Finds rides where source/destination match EXACTLY OR are contained in 'stopovers'
    // LOWER() is used to make it case-insensitive
    @Query("SELECT r FROM Ride r WHERE r.travelDate = :date AND " +
            "(LOWER(r.source) = LOWER(:source) OR LOWER(r.stopovers) LIKE LOWER(CONCAT('%', :source, '%'))) AND " +
            "(LOWER(r.destination) = LOWER(:dest) OR LOWER(r.stopovers) LIKE LOWER(CONCAT('%', :dest, '%')))")
    List<Ride> findSmartRoutes(@Param("source") String source,
                               @Param("dest") String dest,
                               @Param("date") LocalDate date);


}