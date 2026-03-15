package com.tonz.ticketingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingNotificationMessage {
    private UUID bookingId;
    private UUID userId;
    private String userEmail;
    private String userFullName;
    private String matchName;       // "Việt Nam vs Thái Lan"
    private String matchTime;
    private String stadiumName;
    private String seatTypeName;
    private int quantity;
    private BigDecimal totalAmount;
    private String eventType;       // "BOOKING_CONFIRMED" | "BOOKING_CANCELLED"
}