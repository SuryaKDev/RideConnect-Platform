package com.rideconnect.backend.scheduler;

import com.rideconnect.backend.model.Booking;
import com.rideconnect.backend.repository.BookingRepository;
import com.rideconnect.backend.service.EmailService;
import com.rideconnect.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class RideReminderScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    // Run every 30 minutes
    @Scheduled(fixedRate = 30000)
    public void sendRideReminders() {
        System.out.println("⏰ Checking for upcoming rides...");

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        LocalTime upcomingRange = now.plusHours(2); // Check rides in next 2 hours

        List<Booking> upcomingBookings = bookingRepository.findBookingsForReminder(today, now, upcomingRange);

        for (Booking b : upcomingBookings) {
            String passengerEmail = b.getPassenger().getEmail();
            String message = "Your ride from " + b.getRide().getSource() + "to " + b.getRide().getDestination() + " starts soon at " + b.getRide().getTravelTime();

            // 1. Send In-App Notification
            notificationService.notifyUser(passengerEmail, "Ride Reminder", message, "INFO");

            // 2. Send Email
            emailService.sendEmail(passengerEmail, "Reminder: Upcoming Ride", message);

            System.out.println("   -> Reminded: " + passengerEmail);
        }
    }
}