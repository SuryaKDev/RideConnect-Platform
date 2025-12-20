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
    @Query("SELECT r FROM Ride r WHERE " +
            "r.status = 'AVAILABLE' AND " +
            "(:date IS NULL OR r.travelDate = :date) AND " +

            // Source Match: Exact OR contained in stopovers
            "(LOWER(r.source) = LOWER(:source) OR LOWER(r.stopovers) LIKE LOWER(CONCAT('%', :source, '%'))) AND " +

            // Destination Match: Exact OR contained in stopovers
            "(LOWER(r.destination) = LOWER(:dest) OR LOWER(r.stopovers) LIKE LOWER(CONCAT('%', :dest, '%'))) AND " +

            // ... price filters ...
            "(:minPrice IS NULL OR r.pricePerSeat >= :minPrice) AND " +
            "(:maxPrice IS NULL OR r.pricePerSeat <= :maxPrice) AND " +
            "(:minSeats IS NULL OR r.availableSeats >= :minSeats)")
    List<Ride> searchRidesWithFilters(@Param("source") String source,
                                      @Param("dest") String dest,
                                      @Param("date") LocalDate date);


}