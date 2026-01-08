package com.rideconnect.backend.service;

import com.rideconnect.backend.dto.NotificationDto;
import com.rideconnect.backend.model.Notification;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.NotificationRepository;
import com.rideconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // Send a notification to a specific user (identified by email)
    @Transactional
    public void notifyUser(String email, String title, String message, String type) {
        if (email == null || email.isEmpty()) return;

        // 1. Save to Database
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            Notification notificationEntity = Notification.builder()
                    .user(userOpt.get())
                    .title(title)
                    .message(message)
                    .type(type)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notificationEntity);
        }

        // 2. Send via WebSocket
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