package com.rideconnect.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    // @Async ensures the API doesn't wait for the email to send (Fire and Forget)
    @Async
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("📧 Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
            // Don't throw exception here, we don't want to break the main booking flow
            // just because an email failed.
        }
    }

    public void sendBookingConfirmation(String toEmail, String name, String source, String dest, Double amount) {
        String subject = "Ride Confirmed: " + source + " to " + dest;
        String body = "Hello " + name + ",\n\n" +
                "Your ride has been confirmed!\n" +
                "Route: " + source + " -> " + dest + "\n" +
                "Amount Paid: Rs. " + amount + "\n\n" +
                "Have a safe journey!\n" +
                "- Team RideConnect";
        sendEmail(toEmail, subject, body);
    }

    public void sendRideCancellation(String toEmail, String name, String source, String dest) {
        String subject = "URGENT: Ride Cancelled";
        String body = "Hello " + name + ",\n\n" +
                "We regret to inform you that your ride from " + source + " to " + dest + " has been cancelled.\n" +
                "If you have paid, a refund has been initiated.\n\n" +
                "Sorry for the inconvenience,\n" +
                "- Team RideConnect";
        sendEmail(toEmail, subject, body);
    }
}