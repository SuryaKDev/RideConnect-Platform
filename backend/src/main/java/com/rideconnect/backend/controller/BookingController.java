package com.rideconnect.backend.controller;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/book")
    public ResponseEntity<?> bookRide(
            @RequestParam Long rideId,
            @RequestParam Integer seats,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Booking booking = bookingService.bookRide(rideId, seats, userDetails.getUsername());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return bookingService.getMyBookings(userDetails.getUsername());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            bookingService.cancelBooking(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- NEW: ACCEPT ---
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            bookingService.acceptBooking(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Booking accepted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- NEW: REJECT ---
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            bookingService.rejectBooking(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Booking rejected"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}