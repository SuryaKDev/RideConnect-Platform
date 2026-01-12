package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.LoginRequest;
import com.rideconnect.backend.model.Role;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLoginUser_UnverifiedEmail_ShouldThrowException() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        User user = new User();
        user.setEmail("test@example.com");
        user.setEmailVerified(false);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            userService.loginUser(loginRequest);
        });

        assertEquals("Please verify your email before logging in.", exception.getMessage());
    }

    @Test
    void testLoginUser_VerifiedEmail_Success() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        User user = new User();
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setId(1L);
        user.setRole(Role.PASSENGER);
        user.setEmailVerified(true);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(anyString(), anyString(), anyLong())).thenReturn("mock-token");

        var response = userService.loginUser(loginRequest);

        assertNotNull(response);
        assertEquals("mock-token", response.get("token"));
        assertEquals("PASSENGER", response.get("role"));
    }

    @Test
    void testVerifyEmail_Success() {
        String token = "valid-token";
        User user = new User();
        user.setEmailVerificationToken(token);
        user.setEmailVerified(false);

        when(userRepository.findByEmailVerificationToken(token)).thenReturn(Optional.of(user));

        userService.verifyEmail(token);

        assertTrue(user.isEmailVerified());
        assertNull(user.getEmailVerificationToken());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyEmail_InvalidToken() {
        String token = "invalid-token";
        when(userRepository.findByEmailVerificationToken(token)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            userService.verifyEmail(token);
        });

        assertEquals("Invalid verification token", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterUser_ShouldSetMemberSince() {
        User user = new User();
        user.setEmail("new@example.com");
        user.setName("New User");
        user.setPassword("password");
        user.setRole(Role.PASSENGER);

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User savedUser = userService.registerUser(user);

        assertNotNull(savedUser.getMemberSince());
        // Match format like "January 2026"
        assertTrue(savedUser.getMemberSince().matches("^[A-Z][a-z]+ \\d{4}$"));
    }
}
