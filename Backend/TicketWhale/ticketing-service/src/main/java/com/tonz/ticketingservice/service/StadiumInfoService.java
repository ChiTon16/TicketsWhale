package com.tonz.ticketingservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tonz.ticketingservice.dto.response.StadiumInfoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StadiumInfoService {

    private final WebClient.Builder webClientBuilder;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final String CACHE_KEY = "stadiums:all";

    // 20 sân Premier League 2024/25
    private static final List<Map<String, Object>> PL_STADIUMS = List.of(
            Map.of("name", "Emirates Stadium", "team", "Arsenal FC", "city", "London", "capacity", 60704, "opened", 2006),
            Map.of("name", "Villa Park", "team", "Aston Villa FC", "city", "Birmingham", "capacity", 42785, "opened", 1897),
            Map.of("name", "Vitality Stadium", "team", "AFC Bournemouth", "city", "Bournemouth", "capacity", 11307, "opened", 1910),
            Map.of("name", "Gtech Community Stadium", "team", "Brentford FC", "city", "London", "capacity", 17250, "opened", 2020),
            Map.of("name", "Amex Stadium", "team", "Brighton & Hove Albion FC", "city", "Brighton", "capacity", 31800, "opened", 2011),
            Map.of("name", "Stamford Bridge", "team", "Chelsea FC", "city", "London", "capacity", 40341, "opened", 1877),
            Map.of("name", "Selhurst Park", "team", "Crystal Palace FC", "city", "London", "capacity", 25486, "opened", 1924),
            Map.of("name", "Goodison Park", "team", "Everton FC", "city", "Liverpool", "capacity", 39572, "opened", 1892),
            Map.of("name", "Craven Cottage", "team", "Fulham FC", "city", "London", "capacity", 25700, "opened", 1896),
            Map.of("name", "Elland Road", "team", "Leeds United FC", "city", "Leeds", "capacity", 37890, "opened", 1897),
            Map.of("name", "King Power Stadium", "team", "Leicester City FC", "city", "Leicester", "capacity", 32261, "opened", 2002),
            Map.of("name", "Anfield", "team", "Liverpool FC", "city", "Liverpool", "capacity", 61276, "opened", 1884),
            Map.of("name", "Etihad Stadium", "team", "Manchester City FC", "city", "Manchester", "capacity", 53400, "opened", 2003),
            Map.of("name", "Old Trafford", "team", "Manchester United FC", "city", "Manchester", "capacity", 74310, "opened", 1910),
            Map.of("name", "St. James' Park", "team", "Newcastle United FC", "city", "Newcastle", "capacity", 52305, "opened", 1892),
            Map.of("name", "City Ground", "team", "Nottingham Forest FC", "city", "Nottingham", "capacity", 30445, "opened", 1898),
            Map.of("name", "Bramall Lane", "team", "Sheffield United FC", "city", "Sheffield", "capacity", 32050, "opened", 1855),
            Map.of("name", "Tottenham Hotspur Stadium", "team", "Tottenham Hotspur FC", "city", "London", "capacity", 62850, "opened", 2019),
            Map.of("name", "London Stadium", "team", "West Ham United FC", "city", "London", "capacity", 62500, "opened", 2016),
            Map.of("name", "Molineux Stadium", "team", "Wolverhampton Wanderers FC", "city", "Wolverhampton", "capacity", 31750, "opened", 1889)
    );

    public List<StadiumInfoResponse> getAllStadiums() {
        // Check cache
        String cached = redisTemplate.opsForValue().get(CACHE_KEY);
        if (cached != null) {
            try {
                log.info("Cache HIT for stadiums");
                return objectMapper.readValue(cached,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, StadiumInfoResponse.class));
            } catch (Exception e) {
                log.warn("Failed to deserialize cached stadiums");
            }
        }

        // Fetch ảnh từ Wikipedia cho từng sân
        List<StadiumInfoResponse> stadiums = PL_STADIUMS.stream()
                .map(this::buildStadiumResponse)
                .toList();

        // Cache kết quả
        try {
            redisTemplate.opsForValue().set(CACHE_KEY,
                    objectMapper.writeValueAsString(stadiums), CACHE_TTL);
        } catch (Exception e) {
            log.warn("Failed to cache stadiums");
        }

        return stadiums;
    }

    public StadiumInfoResponse getStadiumByName(String name) {
        return getAllStadiums().stream()
                .filter(s -> s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElse(null);
    }

    private StadiumInfoResponse buildStadiumResponse(Map<String, Object> data) {
        String stadiumName = (String) data.get("name");
        String imageUrl = fetchWikipediaImage(stadiumName);

        return StadiumInfoResponse.builder()
                .name(stadiumName)
                .team((String) data.get("team"))
                .city((String) data.get("city"))
                .location("England, UK")
                .capacity((Integer) data.get("capacity"))
                .yearOpened((Integer) data.get("opened"))
                .imageUrl(imageUrl)
                .wikipediaUrl("https://en.wikipedia.org/wiki/" +
                        stadiumName.replace(" ", "_"))
                .build();
    }

    private String fetchWikipediaImage(String stadiumName) {
        try {
            String url = "https://en.wikipedia.org/w/api.php?action=query&titles="
                    + stadiumName.replace(" ", "_")
                    + "&prop=pageimages&format=json&pithumbsize=800"; // ← 800px thay vì mặc định

            String response = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header("User-Agent", "TicketWhale/1.0")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode pages = root.path("query").path("pages");
            JsonNode page = pages.elements().next(); // lấy page đầu tiên

            if (page.has("thumbnail")) {
                return page.get("thumbnail").get("source").asText();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch Wikipedia image for: {}", stadiumName);
        }
        return null;
    }
}