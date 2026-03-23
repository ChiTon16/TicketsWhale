package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.response.HeadToHeadResponse;
import com.tonz.ticketingservice.entity.Match;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiMatchSummaryService {

    private final RedisTemplate<String, String> redisTemplate;
    private final WebClient webClient;
    private final String apiKey;
    private final FootballApiService footballApiService; // ← thêm

    private static final String CACHE_PREFIX = "match:summary:";
    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    public AiMatchSummaryService(
            RedisTemplate<String, String> redisTemplate,
            WebClient.Builder webClientBuilder,
            @Value("${app.gemini.api-key}") String apiKey,
            FootballApiService footballApiService) { // ← thêm
        this.redisTemplate = redisTemplate;
        this.webClient = webClientBuilder.build();
        this.apiKey = apiKey;
        this.footballApiService = footballApiService;
    }

    public String getMatchSummary(Match match) {
        String cacheKey = CACHE_PREFIX + match.getId();

        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.info("Cache HIT for match summary: {}", match.getId());
            return cached;
        }

        // Fetch head2head data thật từ API
        HeadToHeadResponse h2h = null;
        if (match.getExternalId() != null) {
            h2h = footballApiService.getHeadToHead(match.getExternalId());
        }

        log.info("Cache MISS, calling Groq for match: {}", match.getId());
        String summary = generateSummary(match, h2h);

        if (summary != null) {
            redisTemplate.opsForValue().set(cacheKey, summary, CACHE_TTL);
        }

        return summary;
    }

    private String generateSummary(Match match, HeadToHeadResponse h2h) {
        try {
            String prompt = buildPrompt(match, h2h);

            Map<String, Object> requestBody = Map.of(
                    "model", "llama-3.1-8b-instant",
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
                    ),
                    "max_tokens", 200,
                    "temperature", 0.8
            );

            Map response = webClient.post()
                    .uri(GROQ_URL)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            var choices = (List<?>) response.get("choices");
            var message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            log.error("Groq API call failed: {}", e.getMessage(), e);
            return null;
        }
    }

    private String buildPrompt(Match match, HeadToHeadResponse h2h) {
        String matchTime = match.getMatchTime()
                .format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));

        StringBuilder prompt = new StringBuilder();
        prompt.append(String.format("""
                Viết 2-3 câu giới thiệu hấp dẫn bằng tiếng Việt cho trận đấu Premier League:
                - Đội nhà: %s
                - Đội khách: %s
                - Thời gian: %s (UTC)
                - Vòng đấu: %d
                - Sân vận động: %s
                """,
                match.getHomeTeam(),
                match.getAwayTeam(),
                matchTime,
                match.getMatchday(),
                match.getStadium() != null ? match.getStadium().getName() : "TBD"
        ));

        // Thêm data thật nếu có
        if (h2h != null && h2h.getAggregates() != null) {
            var agg = h2h.getAggregates();
            if (agg.getHomeTeam() != null && agg.getAwayTeam() != null) {
                prompt.append(String.format("""
                        
                        Lịch sử đối đầu gần nhất (%d trận):
                        - %s: %d thắng, %d hòa, %d thua
                        - %s: %d thắng, %d hòa, %d thua
                        """,
                        agg.getNumberOfMatches(),
                        agg.getHomeTeam().getName(),
                        agg.getHomeTeam().getWins(),
                        agg.getHomeTeam().getDraws(),
                        agg.getHomeTeam().getLosses(),
                        agg.getAwayTeam().getName(),
                        agg.getAwayTeam().getWins(),
                        agg.getAwayTeam().getDraws(),
                        agg.getAwayTeam().getLosses()
                ));
            }

            // Thêm 3 kết quả gần nhất
            if (h2h.getMatches() != null && !h2h.getMatches().isEmpty()) {
                prompt.append("\nKết quả 3 trận gần nhất:\n");
                h2h.getMatches().stream()
                        .filter(m -> "FINISHED".equals(m.getStatus()))
                        .limit(3)
                        .forEach(m -> {
                            if (m.getScore() != null && m.getScore().getFullTime() != null) {
                                prompt.append(String.format("- %s %d-%d %s\n",
                                        m.getHomeTeam().getName(),
                                        m.getScore().getFullTime().getHome(),
                                        m.getScore().getFullTime().getAway(),
                                        m.getAwayTeam().getName()));
                            }
                        });
            }
        }

        prompt.append("""
                
                Yêu cầu: ngắn gọn, cuốn hút, dựa trên số liệu thật, phù hợp website bán vé.
                Chỉ trả về đoạn văn, không thêm tiêu đề hay ký tự đặc biệt.
                """);

        return prompt.toString();
    }
}