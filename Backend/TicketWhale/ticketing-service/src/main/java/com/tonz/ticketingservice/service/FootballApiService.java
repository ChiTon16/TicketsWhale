package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.response.FootballMatchResponse;
import com.tonz.ticketingservice.entity.Match;
import com.tonz.ticketingservice.entity.Stadium;
import com.tonz.ticketingservice.repository.MatchRepository;
import com.tonz.ticketingservice.repository.StadiumRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FootballApiService {

    private final MatchRepository matchRepository;
    private final StadiumRepository stadiumRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${app.football-api.url}")
    private String apiUrl;

    @Value("${app.football-api.api-key}")
    private String apiKey;

    @Value("${app.football-api.competition}")
    private String competition;

    // ⭐ Chạy mỗi ngày lúc 3 giờ sáng
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void syncMatches() {
        log.info("Starting match sync from Football API...");
        try {
            fetchAndSaveMatches();
            removeExpiredMatches();
            log.info("Match sync completed!");
        } catch (Exception e) {
            log.error("Failed to sync matches", e);
        }
    }

    private void fetchAndSaveMatches() {
        FootballMatchResponse response = webClientBuilder.build()
                .get()
                .uri(apiUrl + "/competitions/" + competition + "/matches?status=SCHEDULED")
                .header("X-Auth-Token", apiKey)
                .retrieve()
                .bodyToMono(FootballMatchResponse.class)
                .block();

        if (response == null || response.getMatches() == null) {
            log.warn("No matches returned from API");
            return;
        }

        for (FootballMatchResponse.MatchDto matchDto : response.getMatches()) {
            // Bỏ qua nếu đã tồn tại
            if (matchRepository.existsByExternalId(matchDto.getId())) {
                continue;
            }

            // Tạo hoặc lấy Stadium
            Stadium stadium = getOrCreateStadium(matchDto);

            // Parse thời gian
            LocalDateTime matchTime = ZonedDateTime
                    .parse(matchDto.getUtcDate())
                    .toLocalDateTime();

            // Tạo Match mới
            Match match = Match.builder()
                    .externalId(matchDto.getId())
                    .homeTeam(matchDto.getHomeTeam().getName())
                    .awayTeam(matchDto.getAwayTeam().getName())
                    .matchTime(matchTime)
                    .status(Match.MatchStatus.SCHEDULED)
                    .stadium(stadium)
                    .build();

            matchRepository.save(match);
            log.info("Saved new match: {} vs {}",
                    match.getHomeTeam(), match.getAwayTeam());
        }
    }

    // Xóa các trận đã qua hơn 24 giờ
    private void removeExpiredMatches() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Match> expiredMatches = matchRepository
                .findByMatchTimeBeforeAndStatus(cutoff, Match.MatchStatus.SCHEDULED);

        for (Match match : expiredMatches) {
            match.setStatus(Match.MatchStatus.FINISHED);
            log.info("Marked match as FINISHED: {} vs {}",
                    match.getHomeTeam(), match.getAwayTeam());
        }
    }

    private Stadium getOrCreateStadium(FootballMatchResponse.MatchDto matchDto) {
        String stadiumName = matchDto.getVenue() != null
                ? matchDto.getVenue().getName()
                : matchDto.getHomeTeam().getName() + " Stadium";

        return stadiumRepository.findByName(stadiumName)
                .orElseGet(() -> stadiumRepository.save(
                        Stadium.builder()
                                .name(stadiumName)
                                .location("England")
                                .totalCapacity(50000)
                                .build()
                ));
    }
}