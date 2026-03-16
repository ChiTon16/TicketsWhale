package com.tonz.ticketingservice.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class SectionResponse {
    private UUID id;
    private String name;           // "EU3"
    private String stand;          // "EAST STAND"
    private BigDecimal price;
    private int totalSeats;
    private int availableSeats;
}