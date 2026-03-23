package com.tonz.ticketingservice.controller;

import com.tonz.ticketingservice.dto.response.NewsResponse;
import com.tonz.ticketingservice.dto.response.StadiumInfoResponse;
import com.tonz.ticketingservice.service.NewsService;
import com.tonz.ticketingservice.service.StadiumInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InfoController {

    private final StadiumInfoService stadiumInfoService;
    private final NewsService newsService;

    @GetMapping("/api/v1/stadiums")
    public ResponseEntity<List<StadiumInfoResponse>> getAllStadiums() {
        return ResponseEntity.ok(stadiumInfoService.getAllStadiums());
    }

    @GetMapping("/api/v1/stadiums/{name}")
    public ResponseEntity<StadiumInfoResponse> getStadium(@PathVariable String name) {
        StadiumInfoResponse stadium = stadiumInfoService.getStadiumByName(name);
        return stadium != null
                ? ResponseEntity.ok(stadium)
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/api/v1/news")
    public ResponseEntity<List<NewsResponse>> getNews() {
        return ResponseEntity.ok(newsService.getLatestNews());
    }
}