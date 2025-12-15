package com.rideconnect.backend.service;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Booking bookRide(Long rideId, Integer seats, String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        // 1. VALIDATION: Check for Past Dates
        // If date is before today, OR (date is today AND time is past), block it.
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (ride.getTravelDate().isBefore(today) ||
                (ride.getTravelDate().equals(today) && ride.getTravelTime().isBefore(now))) {
            throw new RuntimeException("Cannot book a ride in the past!");
        }

        // 2. VALIDATION: Self Booking
        if (ride.getDriver().getId().equals(passenger.getId())) {
            throw new RuntimeException("You cannot book your own ride!");
        }

        // 3. VALIDATION: Double Booking
        // Check if user already booked this ride (and didn't cancel it)
        boolean alreadyBooked = bookingRepository.existsByRideIdAndPassengerEmailAndStatusNot(
                rideId, passengerEmail, "CANCELLED");

        if (alreadyBooked) {
            throw new RuntimeException("You have already booked this ride!");
        }

        // 4. Check Seats
        if (ride.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough seats available!");
        }

        // Proceed with booking
        ride.setAvailableSeats(ride.getAvailableSeats() - seats);
        rideRepository.save(ride);

        Booking booking = Booking.builder()
                .ride(ride)
                .passenger(passenger)
                .seatsBooked(seats)
                .bookingTime(LocalDateTime.now())
                .status("PENDING_PAYMENT")
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String email) {
        return bookingRepository.findByPassengerEmail(email);
    }

    @Transactional
    public void cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getPassenger().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }
}