package com.rideconnect.backend.service;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import jakarta.transaction.Transactional; // Important for data integrity
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional // Ensures seat reduction and booking happen together, or fail together
    public Booking bookRide(Long rideId, Integer seats, String passengerEmail) {
        
        // 1. Find the Passenger
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find the Ride
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        // 3. Check if enough seats are available
        if (ride.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough seats available!");
        }
        
        // 4. Prevent Driver from booking their own ride
        if (ride.getDriver().getId().equals(passenger.getId())) {
             throw new RuntimeException("You cannot book your own ride!");
        }

        // 5. REDUCE SEAT COUNT (Critical Step)
        ride.setAvailableSeats(ride.getAvailableSeats() - seats);
        rideRepository.save(ride);

        // 6. Create the Booking
        Booking booking = Booking.builder()
                .ride(ride)
                .passenger(passenger)
                .seatsBooked(seats)
                .bookingTime(LocalDateTime.now())
                .status("PENDING_PAYMENT")
                .build();

        return bookingRepository.save(booking);
    }
    
    // Get all bookings for the logged-in user
    public List<Booking> getMyBookings(String email) {
        return bookingRepository.findByPassengerEmail(email);
    }
}