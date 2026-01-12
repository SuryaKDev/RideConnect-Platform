package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.RoutePresetDto;
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
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking bookRide(Long rideId, Integer seats, String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passenger.isEmailVerified()) throw new RuntimeException("Please verify your email before booking a ride.");

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        // Validations
        LocalDate today = LocalDate.now();
        if (ride.getTravelDate().isBefore(today)) throw new RuntimeException("Cannot book past rides");
        if (ride.getDriver().getId().equals(passenger.getId())) throw new RuntimeException("Cannot book own ride");

        boolean exists = bookingRepository.existsByRideIdAndPassengerEmailAndStatusNot(rideId, passengerEmail, "CANCELLED");
        if (exists) throw new RuntimeException("You have already requested/booked this ride!");

        if (ride.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough seats available!");
        }

        // Reserve seats immediately to prevent overbooking while waiting for approval
        ride.setAvailableSeats(ride.getAvailableSeats() - seats);
        rideRepository.save(ride);

        Booking booking = Booking.builder()
                .ride(ride)
                .passenger(passenger)
                .seatsBooked(seats)
                .bookingTime(LocalDateTime.now())
                // CHANGED: New Initial Status
                .status("PENDING_APPROVAL")
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Notify Driver
        notificationService.notifyUser(ride.getDriver().getEmail(), "New Ride Request",
                passenger.getName() + " requested " + seats + " seat(s). Please Accept or Reject.", "INFO");

        emailService.sendNewBookingAlertForDriver(
                ride.getDriver().getEmail(),
                ride.getDriver().getName(),
                passenger.getName(),
                ride.getSource(),
                ride.getDestination()
        );

        return savedBooking;
    }

    // --- NEW: Driver Accepts Booking ---
    @Transactional
    public void acceptBooking(Long bookingId, String driverEmail) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));

        // Security Check
        if (!booking.getRide().getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized to accept this booking");
        }

        if (!"PENDING_APPROVAL".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is not pending approval");
        }

        booking.setStatus("PENDING_PAYMENT"); // Now ready for payment
        bookingRepository.save(booking);

        // Notify Passenger
        notificationService.notifyUser(booking.getPassenger().getEmail(), "Request Accepted!",
                "The driver accepted your request. Please complete payment to confirm.", "SUCCESS");
    }

    // --- NEW: Driver Rejects Booking ---
    @Transactional
    public void rejectBooking(Long bookingId, String driverEmail) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRide().getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Not authorized");
        }

        if (!"PENDING_APPROVAL".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot reject this booking");
        }

        // Restore Seats
        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        booking.setStatus("REJECTED");
        bookingRepository.save(booking);

        // Notify Passenger
        notificationService.notifyUser(booking.getPassenger().getEmail(), "Request Rejected",
                "The driver declined your request.", "ERROR");
    }

    @Transactional
    public void cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getPassenger().getEmail().equals(userEmail)) throw new RuntimeException("Not authorized");

        if (booking.getStatus().contains("CANCELLED") || "REJECTED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled/rejected");
        }

        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        if ("CONFIRMED".equals(booking.getStatus())) {
            paymentService.processRefund(bookingId);
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        notificationService.notifyUser(ride.getDriver().getEmail(), "Booking Cancelled",
                booking.getPassenger().getName() + " cancelled their request.", "WARNING");
    }

    public List<Booking> getMyBookings(String email) {
        return bookingRepository.findByPassengerEmail(email);
    }

    // --- NEW: Get Frequent Routes ---
    public List<RoutePresetDto> getRecentRoutes(String email) {
        List<Object[]> results = bookingRepository.findTopRoutesByPassenger(email);
        return results.stream()
                .map(row -> new RoutePresetDto(
                        (String) row[0], // source
                        (String) row[1], // destination
                        (Long) row[2]    // count
                ))
                .collect(Collectors.toList());
    }

    // --- NEW: Get Active Ride for Dashboard ---
    public Booking getActiveRideForToday(String email) {
        List<Booking> active = bookingRepository.findActiveBookingsForToday(email, LocalDate.now());
        if (active.isEmpty()) return null;
        // Return the first one found (assuming users don't double book same time slots usually)
        return active.get(0);
    }
}