package com.rideconnect.backend.repository;

import com.rideconnect.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Finds payments for a specific passenger (Transaction History)
    List<Payment> findByBooking_Passenger_Email(String email);

    List<Payment> findByBooking_Ride_Driver_Email(String email);
}