package com.rideconnect.backend.service;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RideRepository rideRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentService paymentService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testBookRide_UnverifiedEmail_ShouldThrowException() {
        String email = "passenger@example.com";
        User passenger = new User();
        passenger.setEmail(email);
        passenger.setEmailVerified(false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(passenger));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            bookingService.bookRide(1L, 1, email);
        });

        assertEquals("Please verify your email before booking a ride.", exception.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void testBookRide_Success_ShouldReduceSeats() {
        String passengerEmail = "passenger@example.com";
        User passenger = new User();
        passenger.setId(1L);
        passenger.setEmail(passengerEmail);
        passenger.setEmailVerified(true);
        passenger.setName("Passenger");

        User driver = new User();
        driver.setId(2L);
        driver.setEmail("driver@example.com");
        driver.setName("Driver");

        Ride ride = new Ride();
        ride.setId(1L);
        ride.setDriver(driver);
        ride.setAvailableSeats(4);
        ride.setTravelDate(LocalDate.now().plusDays(1));
        ride.setSource("Source");
        ride.setDestination("Dest");

        when(userRepository.findByEmail(passengerEmail)).thenReturn(Optional.of(passenger));
        when(rideRepository.findById(1L)).thenReturn(Optional.of(ride));
        when(bookingRepository.existsByRideIdAndPassengerEmailAndStatusNot(1L, passengerEmail, "CANCELLED")).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking booking = bookingService.bookRide(1L, 2, passengerEmail);

        assertNotNull(booking);
        assertEquals(2, ride.getAvailableSeats());
        assertEquals(2, booking.getSeatsBooked());
        verify(rideRepository).save(ride);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void testRejectBooking_ShouldRestoreSeats() {
        String driverEmail = "driver@example.com";
        User driver = new User();
        driver.setEmail(driverEmail);

        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setAvailableSeats(2);

        Booking booking = new Booking();
        booking.setId(1L);
        booking.setRide(ride);
        booking.setSeatsBooked(2);
        booking.setStatus("PENDING_APPROVAL");
        booking.setPassenger(new User());

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        bookingService.rejectBooking(1L, driverEmail);

        assertEquals(4, ride.getAvailableSeats());
        assertEquals("REJECTED", booking.getStatus());
        verify(rideRepository).save(ride);
        verify(bookingRepository).save(booking);
    }

    @Test
    void testCancelBooking_ShouldRestoreSeats() {
        String passengerEmail = "passenger@example.com";
        User passenger = new User();
        passenger.setEmail(passengerEmail);
        passenger.setName("Passenger");

        User driver = new User();
        driver.setEmail("driver@example.com");

        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setAvailableSeats(2);

        Booking booking = new Booking();
        booking.setId(1L);
        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setSeatsBooked(2);
        booking.setStatus("PENDING_APPROVAL");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        bookingService.cancelBooking(1L, passengerEmail);

        assertEquals(4, ride.getAvailableSeats());
        assertEquals("CANCELLED", booking.getStatus());
        verify(rideRepository).save(ride);
        verify(bookingRepository).save(booking);
    }
}
