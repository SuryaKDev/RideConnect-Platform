package com.rideconnect.backend.repository;

import com.rideconnect.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Find all bookings by a specific passenger (My Bookings)
    List<Booking> findByPassengerEmail(String email);

    //Needed for RideService to cancel all bookings
    List<Booking> findByRideId(Long rideId);

    // FIND UPCOMING BOOKINGS FOR REMINDERS
    @Query("SELECT b FROM Booking b WHERE " +
            "b.status = 'CONFIRMED' AND " +
            "b.ride.travelDate = :today AND " +
            "b.ride.travelTime BETWEEN :now AND :rangeEnd")
    List<Booking> findBookingsForReminder(
            @Param("today") LocalDate today,
            @Param("now") LocalTime now,
            @Param("rangeEnd") LocalTime rangeEnd
    );

    boolean existsByRideIdAndPassengerEmailAndStatusNot(Long rideId, String email, String status);

}