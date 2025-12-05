package com.rideconnect.backend.controller;

import com.rideconnect.backend.model.Ride;
import com.rideconnect.backend.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    // Endpoint: POST /api/rides/post
    @PostMapping("/post")
    public Ride postRide(@RequestBody Ride ride, @AuthenticationPrincipal UserDetails userDetails) {
        // userDetails.getUsername() gives us the email from the token
        return rideService.postRide(ride, userDetails.getUsername());
    }
    
    // Endpoint: GET /api/rides/all (For testing)
    @GetMapping("/all")
    public List<Ride> getAllRides() {
        return rideService.getAllRides();
    }

    // GET /api/rides/search?source=Chennai&destination=Bangalore&date=2025-02-27
    @GetMapping("/search")
    public List<Ride> searchRides(
            @RequestParam String source, 
            @RequestParam String destination,
            @RequestParam String date) { // Date comes as String "YYYY-MM-DD"
        
        LocalDate travelDate = LocalDate.parse(date);
        return rideService.searchRides(source, destination, travelDate);
    }
}