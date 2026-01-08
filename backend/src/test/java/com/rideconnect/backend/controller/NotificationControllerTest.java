package com.rideconnect.backend.controller;

import com.rideconnect.backend.model.Notification;
import com.rideconnect.backend.model.Role;
import com.rideconnect.backend.model.User;
import com.rideconnect.backend.repository.NotificationRepository;
import com.rideconnect.backend.repository.UserRepository;
import com.rideconnect.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.rideconnect.backend.repository.ReviewRepository reviewRepository;

    @Autowired
    private com.rideconnect.backend.repository.BookingRepository bookingRepository;

    @Autowired
    private com.rideconnect.backend.repository.RideRepository rideRepository;

    @Autowired
    private com.rideconnect.backend.repository.PaymentRepository paymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User testUser;

    @BeforeEach
    public void setup() {
        notificationRepository.deleteAll();
        reviewRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        rideRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .name("Test User")
                .email("test@example.com")
                .password("password")
                .phone("1234567890")
                .role(Role.PASSENGER)
                .build();
        userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void getMyNotifications_ShouldReturnList() throws Exception {
        notificationService.notifyUser("test@example.com", "Test Title", "Test Message", "INFO");

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Title"))
                .andExpect(jsonPath("$[0].message").value("Test Message"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void markAsRead_ShouldUpdateStatus() throws Exception {
        notificationService.notifyUser("test@example.com", "Test Title", "Test Message", "INFO");
        Notification notification = notificationRepository.findAll().get(0);

        mockMvc.perform(put("/api/notifications/" + notification.getId() + "/read"))
                .andExpect(status().isOk());

        Notification updated = notificationRepository.findById(notification.getId()).get();
        assert updated.isRead();
    }
}
