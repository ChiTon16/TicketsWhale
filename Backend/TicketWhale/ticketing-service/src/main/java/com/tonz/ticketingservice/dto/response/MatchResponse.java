package com.tonz.ticketingservice.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class MatchResponse {
    private UUID id;
    private String homeTeam;
    private String awayTeam;
    private String homeCrest;
    private String awayCrest;
    private LocalDateTime matchTime;
    private String status;
    private Integer matchday;
    private String stadiumName;
    private String aiSummary; // ← thêm dòng này
}