package com.rideconnect.backend.repository;

import com.rideconnect.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Find all bookings by a specific passenger (My Bookings)
    List<Booking> findByPassengerEmail(String email);
}