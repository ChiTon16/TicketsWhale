package com.tonz.ticketingservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tonz.ticketingservice.dto.response.NewsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // ← đúng import
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor // ← thêm vào
@Slf4j
public class NewsService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;

    @Value("${app.newsapi.api-key}")
    private String newsApiKey;

    private static final String CACHE_KEY = "news:pl";
    private static final Duration CACHE_TTL = Duration.ofHours(1);
    private static final String NEWSAPI_URL =
            "https://newsapi.org/v2/everything?q=Premier+League&language=en&sortBy=publishedAt&pageSize=20";
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    // ← xóa constructor thủ công, @RequiredArgsConstructor lo rồi

    public List<NewsResponse> getLatestNews() {
        String cached = redisTemplate.opsForValue().get(CACHE_KEY);
        if (cached != null) {
            try {
                log.info("Cache HIT for news");
                return objectMapper.readValue(cached,
                        objectMapper.getTypeFactory()
                                .constructCollectionType(List.class, NewsResponse.class));
            } catch (Exception e) {
                log.warn("Failed to deserialize cached news");
            }
        }

        List<NewsResponse> news = fetchFromNewsApi();

        try {
            if (!news.isEmpty()) {
                redisTemplate.opsForValue().set(CACHE_KEY,
                        objectMapper.writeValueAsString(news), CACHE_TTL);
            }
        } catch (Exception e) {
            log.warn("Failed to cache news");
        }

        return news;
    }

    private List<NewsResponse> fetchFromNewsApi() {
        try {
            String response = webClientBuilder.build()
                    .get()
                    .uri(NEWSAPI_URL)
                    .header("X-Api-Key", newsApiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode articles = root.get("articles");

            return StreamSupport
                    .stream(articles.spliterator(), false)
                    .map(this::toNewsResponse)
                    .toList();

        } catch (Exception e) {
            log.error("Failed to fetch NewsAPI: {}", e.getMessage());
            return List.of();
        }
    }

    private NewsResponse toNewsResponse(JsonNode article) {
        String publishedAt = null;
        try {
            String raw = article.path("publishedAt").asText();
            publishedAt = ZonedDateTime.parse(raw)
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(FORMATTER);
        } catch (Exception ignored) {}

        return NewsResponse.builder()
                .title(article.path("title").asText(null))
                .description(article.path("description").asText(null))
                .url(article.path("url").asText(null))
                .imageUrl(article.path("urlToImage").asText(null))
                .publishedAt(publishedAt)
                .source(article.path("source").path("name").asText("Unknown"))
                .build();
    }
}