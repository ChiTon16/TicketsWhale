package com.tonz.ticketingservice.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HeadToHeadResponse {

    private Aggregates aggregates;
    private List<MatchResult> matches;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Aggregates {
        private Integer numberOfMatches;
        private TeamAgg homeTeam;
        private TeamAgg awayTeam;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TeamAgg {
        private Long id;
        private String name;
        private Integer wins;
        private Integer draws;
        private Integer losses;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MatchResult {
        private String utcDate;
        private String status;
        private TeamDto homeTeam;
        private TeamDto awayTeam;
        private Score score;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TeamDto {
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Score {
        private FullTime fullTime;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FullTime {
        private Integer home;
        private Integer away;
    }
}