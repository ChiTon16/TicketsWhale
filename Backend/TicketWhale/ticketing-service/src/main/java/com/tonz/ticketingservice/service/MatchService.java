package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.response.MatchResponse;
import com.tonz.ticketingservice.entity.Match;
import com.tonz.ticketingservice.exception.AppException;
import com.tonz.ticketingservice.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchService {

    private final MatchRepository matchRepository;
    private final AiMatchSummaryService aiMatchSummaryService;

    public List<MatchResponse> getAllMatches() {
        return matchRepository.findAll().stream()
                .map(m -> toMatchResponse(m, false)) // ← không gọi AI
                .toList();
    }

    public MatchResponse getMatchById(UUID matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "MATCH_NOT_FOUND", "Trận đấu không tồn tại"));

        return toMatchResponse(match, true); // ← có gọi AI
    }

    private MatchResponse toMatchResponse(Match match, boolean withAiSummary) {
        String aiSummary = null;

        if (withAiSummary) {
            try {
                aiSummary = aiMatchSummaryService.getMatchSummary(match);
            } catch (Exception e) {
                log.warn("Failed to get AI summary for match {}: {}", match.getId(), e.getMessage()); // ← sửa dòng này
            }
        }

        return MatchResponse.builder()
                .id(match.getId())
                .homeTeam(match.getHomeTeam())
                .awayTeam(match.getAwayTeam())
                .homeCrest(match.getHomeCrest())
                .awayCrest(match.getAwayCrest())
                .matchTime(match.getMatchTime())
                .status(match.getStatus().name())
                .matchday(match.getMatchday())
                .stadiumName(match.getStadium() != null
                        ? match.getStadium().getName() : null)
                .aiSummary(aiSummary)
                .build();
    }
}