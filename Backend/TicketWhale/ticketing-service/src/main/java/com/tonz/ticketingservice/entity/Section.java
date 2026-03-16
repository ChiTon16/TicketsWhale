package com.tonz.ticketingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "sections")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;          // "EU3", "101", "VIP-A"

    @Column(nullable = false)
    private String stand;         // "EAST STAND", "WEST STAND"

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int totalSeats;

    @Column(nullable = false)
    private int availableSeats;   // ← Pessimistic Lock cái này

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;
}