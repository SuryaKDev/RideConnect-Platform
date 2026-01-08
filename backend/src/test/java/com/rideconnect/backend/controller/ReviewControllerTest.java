package com.rideconnect.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "test@example.com")
    public void submitReview_MissingBookingId_ShouldReturnBadRequest() throws Exception {
        String json = "{\"rating\": 5, \"comment\": \"Great ride!\"}";
        mockMvc.perform(post("/api/reviews/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void submitReview_MissingRating_ShouldReturnBadRequest() throws Exception {
        String json = "{\"bookingId\": 1, \"comment\": \"Great ride!\"}";
        mockMvc.perform(post("/api/reviews/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }
}
