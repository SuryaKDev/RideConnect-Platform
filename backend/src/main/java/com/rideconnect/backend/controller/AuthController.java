package com.rideconnect.backend.controller;

import com.rideconnect.backend.dto.LoginRequest;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.security.JwtUtil;
import com.rideconnect.backend.service.UserService;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;



    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            
            // OLD WAY: return ResponseEntity.ok("User registered successfully...");
            
            // NEW WAY: Return the whole object 
            return ResponseEntity.ok(registeredUser);
            
        } catch (RuntimeException e) {
            // It is also better to send errors as JSON, not plain strings
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

@PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(), 
                    loginRequest.getPassword()
                )
            );

            String token = jwtUtil.generateToken(loginRequest.getEmail());
            return ResponseEntity.ok(Collections.singletonMap("token", token));

        } catch (DisabledException e) {
            // Direct catch
            return ResponseEntity.status(403).body("ACCESS DENIED: Your account has been blocked by Admin.");
            
        } catch (InternalAuthenticationServiceException e) {
            // 2. NEW CATCH BLOCK: Unwrap the box!
            if (e.getCause() instanceof DisabledException) {
                 return ResponseEntity.status(403).body("ACCESS DENIED: Your account has been blocked by Admin.");
            }
            return ResponseEntity.status(500).body("Authentication Error: " + e.getMessage());

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password.");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }
}