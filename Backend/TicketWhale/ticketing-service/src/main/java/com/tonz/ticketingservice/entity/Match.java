package com.tonz.ticketingservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "matches")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Thêm vào Match.java
    @Column(unique = true)
    private Long externalId;    // ID từ football-data.org

    @Column(nullable = false)
    private String homeTeam;

    @Column(nullable = false)
    private String awayTeam;

    @Column(nullable = false)
    private LocalDateTime matchTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MatchStatus status = MatchStatus.SCHEDULED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stadium_id", nullable = false)
    private Stadium stadium;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL)
    private List<SeatType> seatTypes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum MatchStatus {
        SCHEDULED, ONGOING, FINISHED, CANCELLED
    }
}