package com.tonz.ticketingservice.controller;

import com.tonz.ticketingservice.dto.response.MatchResponse;
import com.tonz.ticketingservice.repository.MatchRepository;
import com.tonz.ticketingservice.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService; // ← thay MatchRepository bằng MatchService

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getAllMatches() {
        return ResponseEntity.ok(matchService.getAllMatches());
    }

    @GetMapping("/{matchId}")
    public ResponseEntity<MatchResponse> getMatchById(@PathVariable UUID matchId) {
        return ResponseEntity.ok(matchService.getMatchById(matchId));
    }
}