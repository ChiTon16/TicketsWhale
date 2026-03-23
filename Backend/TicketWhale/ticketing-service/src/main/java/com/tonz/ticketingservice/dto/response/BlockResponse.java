package com.tonz.ticketingservice.dto.response;

import com.tonz.ticketingservice.entity.Block.BlockStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockResponse {

    private UUID id;
    private String name;
    private BigDecimal price;
    private int totalTickets;
    private int availableTickets;
    private BlockStatus status;

    // Thay vì trả về nguyên Object Section (gây vòng lặp hoặc dư thừa),
    // ta chỉ trả về ID của Section đó.
    private UUID sectionId;
}