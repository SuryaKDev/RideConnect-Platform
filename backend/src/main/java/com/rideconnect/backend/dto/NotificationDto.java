package com.rideconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {
    private String message;
    private String type; // e.g., "BOOKING", "CANCEL", "PAYMENT"
    private Long referenceId; // rideId or bookingId
}