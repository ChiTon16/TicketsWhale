package com.tonz.ticketingservice.dto.response;

import com.tonz.ticketingservice.entity.Ticket;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class TicketResponse {
    private UUID id;
    private UUID sectionId;      // ← đổi từ seatTypeId
    private String sectionName;  // ← đổi từ seatTypeName
    private BigDecimal price;
    private Ticket.TicketStatus status;
}