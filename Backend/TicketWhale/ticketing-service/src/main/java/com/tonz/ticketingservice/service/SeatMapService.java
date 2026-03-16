package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.response.SectionResponse;
import com.tonz.ticketingservice.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatMapService {

    private final SectionRepository sectionRepository;

    public List<SectionResponse> getSectionsByMatch(UUID matchId) {
        return sectionRepository.findByMatchId(matchId).stream()
                .map(s -> SectionResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .stand(s.getStand())
                        .price(s.getPrice())
                        .totalSeats(s.getTotalSeats())
                        .availableSeats(s.getAvailableSeats())
                        .build())
                .toList();
    }
}