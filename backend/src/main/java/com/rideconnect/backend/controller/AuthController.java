package com.rideconnect.backend.controller;

import com.rideconnect.backend.dto.LoginRequest;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.security.JwtUtil;
import com.rideconnect.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // If validation fails in Service, it throws RuntimeException
        // GlobalExceptionHandler catches it and returns 400 Bad Request
        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // If password wrong -> BadCredentialsException -> GlobalHandler returns 401
        // If user blocked -> DisabledException -> GlobalHandler returns 403
        Map<String, Object> response = userService.loginUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            long remainingMs = jwtUtil.getRemainingTimeInMs(jwt);

            if (remainingMs > 0) {
                redisTemplate.opsForValue().set(
                        BLACKLIST_PREFIX + jwt,
                        "blacklisted",
                        java.time.Duration.ofMillis(remainingMs)
                );
            }
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        userService.processForgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "Password reset link sent to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        userService.resetPassword(token, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully!"));
    }
}
