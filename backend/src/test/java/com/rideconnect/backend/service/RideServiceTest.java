package com.rideconnect.backend.service;

import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.RideRepository;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.service.impl.GoogleMapsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RideServiceTest {

    @Mock
    private RideRepository rideRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GoogleMapsService googleMapsService;

    @Mock
    private DistanceService distanceService;

    @InjectMocks
    private RideService rideService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testPostRide_UnverifiedEmail_ShouldThrowException() {
        String email = "driver@example.com";
        User driver = new User();
        driver.setEmail(email);
        driver.setEmailVerified(false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(driver));

        Ride ride = new Ride();
        ride.setTravelDate(LocalDate.now().plusDays(1));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            rideService.postRide(ride, email);
        });

        assertEquals("Please verify your email before posting a ride.", exception.getMessage());
        verify(rideRepository, never()).save(any());
    }
}
