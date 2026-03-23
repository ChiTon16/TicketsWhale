package com.tonz.ticketingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "blocks",
        indexes = @Index(columnList = "section_id, status"))
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;              // "Block 102", "Block 214"

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int totalTickets;

    @Column(nullable = false)
    private int availableTickets;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BlockStatus status = BlockStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    public enum BlockStatus {
        AVAILABLE, SOLD_OUT
    }
}