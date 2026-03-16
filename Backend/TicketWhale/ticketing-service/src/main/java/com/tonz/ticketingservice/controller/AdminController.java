package com.tonz.ticketingservice.controller;

import com.tonz.ticketingservice.service.FootballApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Thêm vào một AdminController mới
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final FootballApiService footballApiService;

    @PostMapping("/sync-matches")
    public ResponseEntity<String> syncMatches() {
        footballApiService.syncMatches();
        return ResponseEntity.ok("Sync triggered successfully!");
    }
}