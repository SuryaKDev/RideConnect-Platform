package com.rideconnect.backend.controller;

import com.rideconnect.backend.model.Notification;
import com.rideconnect.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(userDetails.getUsername());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    if (!notification.getUser().getEmail().equals(userDetails.getUsername())) {
                        return ResponseEntity.status(403).body(Map.of("message", "Not authorized"));
                    }
                    notification.setRead(true);
                    notificationRepository.save(notification);
                    return ResponseEntity.ok(Map.of("message", "Marked as read"));
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(userDetails.getUsername());
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
