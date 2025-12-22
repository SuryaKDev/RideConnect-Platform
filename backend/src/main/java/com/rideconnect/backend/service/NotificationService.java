package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.NotificationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Send a notification to a specific user (identified by email)
    public void notifyUser(String email, String title, String message, String type) {
        if (email == null || email.isEmpty()) return;

        NotificationDto notification = NotificationDto.builder()
                .title(title)
                .message(message)
                .type(type)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")))
                .build();

        // Push to: /topic/user/{email}
        // Frontend will subscribe to this specific channel
        messagingTemplate.convertAndSend("/topic/user/" + email, notification);

        System.out.println("🔔 Notification sent to " + email + ": " + message);
    }

    public void notifyDriver(String email, String message) {
        notifyUser(email, "Ride Update", message, "INFO");
    }

    public void notifyPassenger(String email, String message) {
        notifyUser(email, "Booking Update", message, "INFO");
    }
}