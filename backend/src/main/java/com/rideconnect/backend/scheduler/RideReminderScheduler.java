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

    @Autowired
    private com.rideconnect.backend.repository.PaymentRepository paymentRepository;

    @Autowired
    private com.rideconnect.backend.repository.UserRepository userRepository;

    // Run every 30 minutes
    @Scheduled(fixedRate = 1800000)
    public void sendRideReminders() {
        System.out.println("⏰ Checking for upcoming rides...");

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        LocalTime upcomingRange = now.plusHours(2); // Check rides in next 2 hours

        List<Booking> upcomingBookings = bookingRepository.findBookingsForReminder(today, now, upcomingRange);

        for (Booking b : upcomingBookings) {
            String passengerEmail = b.getPassenger().getEmail();
            String message = "Your ride from " + b.getRide().getSource() + " to " + b.getRide().getDestination() + " starts soon at " + b.getRide().getTravelTime();

            // 1. Send In-App Notification
            notificationService.notifyUser(passengerEmail, "Ride Reminder", message, "INFO");

            // 2. Send Email
            emailService.sendEmail(passengerEmail, "Reminder: Upcoming Ride", message);

            System.out.println("   -> Reminded: " + passengerEmail);
        }
    }

    // Run on the 1st of every month at midnight
    @Scheduled(cron = "0 0 0 1 * ?")
    public void sendMonthlySummaries() {
        System.out.println("📊 Generating monthly summaries...");
        List<String> emails = paymentRepository.findAllPassengerEmails();
        java.time.LocalDateTime oneMonthAgo = java.time.LocalDateTime.now().minusMonths(1);

        for (String email : emails) {
            com.rideconnect.backend.model.User user = userRepository.findByEmail(email).orElse(null);
            if (user != null && !user.isEmailOptOut()) {
                List<com.rideconnect.backend.model.Payment> payments = paymentRepository.findPassengerPaymentsSince(email, oneMonthAgo);
                double totalSpent = payments.stream().mapToDouble(com.rideconnect.backend.model.Payment::getAmount).sum();
                int rideCount = payments.size();

                if (rideCount > 0) {
                    emailService.sendMonthlySummary(email, user.getName(), totalSpent, rideCount);
                }
            }
        }
    }
}