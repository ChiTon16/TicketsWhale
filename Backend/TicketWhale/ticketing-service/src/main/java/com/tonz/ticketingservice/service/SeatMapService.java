package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.response.BlockResponse;
import com.tonz.ticketingservice.dto.response.SectionResponse;
import com.tonz.ticketingservice.repository.BlockRepository;
import com.tonz.ticketingservice.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatMapService {

    private final SectionRepository sectionRepository;
    private final BlockRepository blockRepository;

    public List<SectionResponse> getSectionsByMatch(UUID matchId) {
        return sectionRepository.findByMatchId(matchId).stream()
                .map(section -> {
                    List<BlockResponse> blocks = blockRepository
                            .findBySectionId(section.getId())
                            .stream()
                            .map(block -> BlockResponse.builder()
                                    .id(block.getId())
                                    .name(block.getName())
                                    .price(block.getPrice())
                                    .totalTickets(block.getTotalTickets())
                                    .availableTickets(block.getAvailableTickets())
                                    .status(block.getStatus())
                                    .build())
                            .toList();

                    return SectionResponse.builder()
                            .id(section.getId())
                            .name(section.getName())
                            .stand(section.getStand())
                            .price(section.getPrice())
                            .totalSeats(section.getTotalSeats())
                            .availableSeats(section.getAvailableSeats())
                            .blocks(blocks)
                            .build();
                })
                .toList();
    }
}