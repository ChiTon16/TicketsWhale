package com.tonz.ticketingservice.controller;

import com.tonz.ticketingservice.dto.response.SectionResponse;
import com.tonz.ticketingservice.service.SeatMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class SeatMapController {

    private final SeatMapService seatMapService;

    @GetMapping("/{matchId}/sections")
    public ResponseEntity<List<SectionResponse>> getSections(
            @PathVariable UUID matchId) {
        return ResponseEntity.ok(seatMapService.getSectionsByMatch(matchId));
    }
}
