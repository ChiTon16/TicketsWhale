package com.tonz.ticketingservice.repository;

import com.tonz.ticketingservice.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {
    // Thêm vào MatchRepository.java
    boolean existsByExternalId(Long externalId);

    List<Match> findByMatchTimeBeforeAndStatus(
            LocalDateTime time, Match.MatchStatus status);

    List<Match> findByStatus(Match.MatchStatus status);
}