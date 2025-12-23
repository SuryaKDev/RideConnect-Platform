package com.rideconnect.backend.controller;

import com.rideconnect.backend.dto.PassengerDto;
import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    @PostMapping("/post")
    public Ride postRide(@RequestBody Ride ride, @AuthenticationPrincipal UserDetails userDetails) {
        return rideService.postRide(ride, userDetails.getUsername());
    }

    @GetMapping("/all")
    public List<Ride> getAllRides() {
        return rideService.getAllRides();
    }

    @GetMapping("/my-rides")
    public List<Ride> getMyRides(@AuthenticationPrincipal UserDetails userDetails) {
        return rideService.getMyRides(userDetails.getUsername());
    }

    // UPDATED: Made 'source' and 'destination' optional (required = false)
    @GetMapping("/search")
    public List<Ride> searchRides(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) Double minRating) {

        LocalDate travelDate = null;
        if (date != null && !date.trim().isEmpty()) {
            travelDate = LocalDate.parse(date);
        }

        return rideService.searchRides(
                source, destination, travelDate,
                minPrice, maxPrice, minSeats, minRating
        );
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            rideService.cancelRide(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Ride cancelled successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/bookings")
    public ResponseEntity<?> getRideBookings(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<PassengerDto> passengers = rideService.getPassengersForRide(id, userDetails.getUsername());
            return ResponseEntity.ok(passengers);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}