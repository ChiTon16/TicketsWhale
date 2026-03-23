package com.tonz.ticketingservice.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FootballMatchResponse {
    private List<MatchDto> matches;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MatchDto {
        private Long id;
        private String utcDate;
        private String status;
        private Integer matchday;    // ← thêm
        private TeamDto homeTeam;
        private TeamDto awayTeam;
        private VenueDto venue;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TeamDto {
        private Long id;
        private String name;         // "Arsenal FC"
        private String shortName;    // "Arsenal"
        private String crest;        // ← thêm URL logo
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VenueDto {
        private String name;         // "Emirates Stadium"
    }
}