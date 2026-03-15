package com.tonz.ticketingservice.repository;

import com.tonz.ticketingservice.entity.SeatType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatTypeRepository extends JpaRepository<SeatType, UUID> {

    // ⭐ PESSIMISTIC LOCK - đây là kỹ thuật chống overbooking
    // SELECT ... FOR UPDATE - lock row này lại cho đến khi transaction xong
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SeatType s WHERE s.id = :id")
    Optional<SeatType> findByIdWithLock(UUID id);
}