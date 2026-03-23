package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.response.FootballMatchResponse;
import com.tonz.ticketingservice.dto.response.HeadToHeadResponse;
import com.tonz.ticketingservice.entity.Block;
import com.tonz.ticketingservice.entity.Match;
import com.tonz.ticketingservice.entity.Section;
import com.tonz.ticketingservice.entity.Stadium;
import com.tonz.ticketingservice.repository.BlockRepository;
import com.tonz.ticketingservice.repository.MatchRepository;
import com.tonz.ticketingservice.repository.SectionRepository;
import com.tonz.ticketingservice.repository.StadiumRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FootballApiService {

    private final MatchRepository matchRepository;
    private final StadiumRepository stadiumRepository;
    private final WebClient.Builder webClientBuilder;
    private final SectionRepository sectionRepository;
    private final BlockRepository blockRepository;

    @Value("${app.football-api.url}")
    private String apiUrl;

    @Value("${app.football-api.api-key}")
    private String apiKey;

    @Value("${app.football-api.competition}")
    private String competition;

    // ⭐ Chạy mỗi ngày lúc 3 giờ sáng — Sync từ API (Hướng A)
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void syncMatches() {
        log.info("Starting match sync from Football API...");
        try {
            fetchAndSaveMatches();       // A: sync status thật từ API
            markExpiredMatchesLocally(); // B: fallback theo matchTime
            log.info("Match sync completed!");
        } catch (Exception e) {
            log.error("Failed to sync matches", e);
        }
    }

    // Chạy mỗi tuần dọn matches đã FINISHED quá 30 ngày
    @Scheduled(cron = "0 0 4 * * MON")
    @Transactional
    public void cleanupOldMatches() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        List<Match> oldMatches = matchRepository
                .findByMatchTimeBeforeAndStatus(
                        cutoff, Match.MatchStatus.FINISHED);

        if (oldMatches.isEmpty()) return;

        // Xóa cascade sections + blocks + tickets
        matchRepository.deleteAll(oldMatches);
        log.info("Cleaned up {} old matches", oldMatches.size());
    }

    private void fetchAndSaveMatches() {
        // Fetch cả SCHEDULED lẫn IN_PLAY và FINISHED để update status
        FootballMatchResponse response = webClientBuilder.build()
                .get()
                .uri(apiUrl + "/competitions/" + competition + "/matches")
                .header("X-Auth-Token", apiKey)
                .retrieve()
                .bodyToMono(FootballMatchResponse.class)
                .block();

        if (response == null || response.getMatches() == null) {
            log.warn("No matches returned from API");
            return;
        }

        for (FootballMatchResponse.MatchDto matchDto : response.getMatches()) {
            boolean exists = matchRepository.existsByExternalId(matchDto.getId());

            if (exists) {
                // ✅ BUG FIX #2: Update status cho match đã tồn tại
                matchRepository.findByExternalId(matchDto.getId()).ifPresent(match -> {
                    Match.MatchStatus newStatus = mapApiStatus(matchDto.getStatus());
                    if (match.getStatus() != newStatus) {
                        log.info("Updating match status: {} vs {} → {}",
                                match.getHomeTeam(), match.getAwayTeam(), newStatus);
                        match.setStatus(newStatus);
                        matchRepository.save(match);
                    }
                });
                continue;
            }

            // Chỉ tạo mới nếu là SCHEDULED
            if (!"SCHEDULED".equals(matchDto.getStatus()) &&
                    !"TIMED".equals(matchDto.getStatus())) {
                continue;
            }

            Stadium stadium = getOrCreateStadium(matchDto);

            LocalDateTime matchTime = ZonedDateTime
                    .parse(matchDto.getUtcDate())
                    .toLocalDateTime();

            Match match = Match.builder()
                    .externalId(matchDto.getId())
                    .homeTeam(matchDto.getHomeTeam().getName())
                    .awayTeam(matchDto.getAwayTeam().getName())
                    .homeCrest(matchDto.getHomeTeam().getCrest())
                    .awayCrest(matchDto.getAwayTeam().getCrest())
                    .matchTime(matchTime)
                    .matchday(matchDto.getMatchday())
                    .status(Match.MatchStatus.SCHEDULED)
                    .stadium(stadium)
                    .build();

            matchRepository.save(match);
            log.info("Saved new match: {} vs {}", match.getHomeTeam(), match.getAwayTeam());
            createDefaultSections(match);
        }
    }

    // ✅ BUG FIX #1: Hướng B — fallback local, có saveAll()
    private void markExpiredMatchesLocally() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(2);

        List<Match> expiredMatches = matchRepository
                .findByMatchTimeBeforeAndStatus(cutoff, Match.MatchStatus.SCHEDULED);

        if (expiredMatches.isEmpty()) return;

        expiredMatches.forEach(match -> {
            match.setStatus(Match.MatchStatus.FINISHED);
            log.info("Locally marked FINISHED: {} vs {}", match.getHomeTeam(), match.getAwayTeam());
        });

        matchRepository.saveAll(expiredMatches); // ← đây là dòng bị thiếu trước đó!
        log.info("Marked {} expired matches as FINISHED", expiredMatches.size());
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

    private void createDefaultSections(Match match) {
        // NORTH STAND
        createSectionWithBlocks(match, "North Stand Upper", "NORTH STAND",
                800000, 200,
                new String[]{"Block 501", "Block 502", "Block 503", "Block 504"},
                50);

        createSectionWithBlocks(match, "North Stand Lower", "NORTH STAND",
                600000, 300,
                new String[]{"Block 505", "Block 506", "Block 507", "Block 508", "Block 509"},
                60);

        createSectionWithBlocks(match, "North Stand Terrace", "NORTH STAND",
                400000, 400,
                new String[]{"Block 510", "Block 511", "Block 512", "Block 513"},
                100);

        // SOUTH STAND
        createSectionWithBlocks(match, "South Stand Upper", "SOUTH STAND",
                800000, 200,
                new String[]{"Block 401", "Block 402", "Block 403", "Block 404"},
                50);

        createSectionWithBlocks(match, "South Stand Lower", "SOUTH STAND",
                600000, 300,
                new String[]{"Block 405", "Block 406", "Block 407", "Block 408"},
                75);

        // EAST STAND
        createSectionWithBlocks(match, "East Stand Executive", "EAST STAND",
                2000000, 50,
                new String[]{"Block 101", "Block 102", "Block 103"},
                16);

        createSectionWithBlocks(match, "East Stand Upper", "EAST STAND",
                1000000, 200,
                new String[]{"Block 104", "Block 105", "Block 106", "Block 107"},
                50);

        createSectionWithBlocks(match, "East Stand Lower", "EAST STAND",
                700000, 300,
                new String[]{"Block 108", "Block 109", "Block 110", "Block 111", "Block 112"},
                60);

        // WEST STAND
        createSectionWithBlocks(match, "West Stand VIP", "WEST STAND",
                3000000, 30,
                new String[]{"Block 201", "Block 202"},
                15);

        createSectionWithBlocks(match, "West Stand Club Level", "WEST STAND",
                2000000, 80,
                new String[]{"Block 203", "Block 204", "Block 205"},
                26);

        createSectionWithBlocks(match, "West Stand Upper", "WEST STAND",
                1000000, 200,
                new String[]{"Block 206", "Block 207", "Block 208", "Block 209"},
                50);

        createSectionWithBlocks(match, "West Stand Lower", "WEST STAND",
                700000, 300,
                new String[]{"Block 210", "Block 211", "Block 212", "Block 213", "Block 214"},
                60);

        log.info("Created sections + blocks for match: {} vs {}",
                match.getHomeTeam(), match.getAwayTeam());
    }

    private void createSectionWithBlocks(
            Match match,
            String sectionName,
            String stand,
            int priceVnd,
            int totalSeats,
            String[] blockNames,
            int ticketsPerBlock) {

        Section section = Section.builder()
                .name(sectionName)
                .stand(stand)
                .price(BigDecimal.valueOf(priceVnd))
                .totalSeats(totalSeats)
                .availableSeats(totalSeats)
                .match(match)
                .build();

        sectionRepository.save(section);

        // Tạo blocks cho section này
        List<Block> blocks = Arrays.stream(blockNames)
                .map(blockName -> Block.builder()
                        .name(blockName)
                        .price(BigDecimal.valueOf(priceVnd))
                        .totalTickets(ticketsPerBlock)
                        .availableTickets(ticketsPerBlock)
                        .status(Block.BlockStatus.AVAILABLE)
                        .section(section)
                        .build())
                .toList();

        blockRepository.saveAll(blocks);
    }

    private Match.MatchStatus mapApiStatus(String apiStatus) {
        return switch (apiStatus) {
            case "IN_PLAY", "PAUSED", "HALFTIME" -> Match.MatchStatus.ONGOING;    // ← ONGOING
            case "FINISHED", "AWARDED"           -> Match.MatchStatus.FINISHED;
            case "POSTPONED", "SUSPENDED",
                 "CANCELLED"                     -> Match.MatchStatus.CANCELLED;
            default                              -> Match.MatchStatus.SCHEDULED;  // SCHEDULED, TIMED
        };
    }

    public HeadToHeadResponse getHeadToHead(Long externalId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(apiUrl + "/matches/" + externalId + "/head2head?limit=5")
                    .header("X-Auth-Token", apiKey)
                    .retrieve()
                    .bodyToMono(HeadToHeadResponse.class)
                    .block();
        } catch (Exception e) {
            log.warn("Failed to fetch head2head for match {}: {}", externalId, e.getMessage());
            return null;
        }
    }
}