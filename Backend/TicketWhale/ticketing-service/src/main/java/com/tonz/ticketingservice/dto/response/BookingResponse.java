package com.tonz.ticketingservice.dto.response;

import com.tonz.ticketingservice.entity.Booking;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class BookingResponse {
    private UUID id;
    private UUID userId;
    private BigDecimal totalAmount;
    private Booking.BookingStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private List<TicketResponse> tickets;
    private MatchInfo match;            // ← thêm

    @Getter
    @Builder
    public static class MatchInfo {
        private UUID id;
        private String homeTeam;
        private String awayTeam;
        private String homeCrest;
        private String awayCrest;
        private LocalDateTime matchTime;
        private String stadiumName;
    }
}