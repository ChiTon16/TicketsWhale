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

    // Thêm vào Match.java
    @Column
    private String homeCrest;     // URL logo đội nhà
    @Column
    private String awayCrest;     // URL logo đội khách
    @Column
    private String competitionEmblem;  // Logo Premier League
    @Column
    private Integer matchday;     // Vòng đấu thứ mấy

    @Column(nullable = false)
    private LocalDateTime matchTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MatchStatus status = MatchStatus.SCHEDULED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stadium_id", nullable = false)
    private Stadium stadium;

    // Match.java
    @OneToMany(mappedBy = "match",
            cascade = CascadeType.ALL,      // ← tự xóa sections khi xóa match
            orphanRemoval = true)
    private List<Section> sections;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum MatchStatus {
        SCHEDULED, ONGOING, FINISHED, CANCELLED
    }
}