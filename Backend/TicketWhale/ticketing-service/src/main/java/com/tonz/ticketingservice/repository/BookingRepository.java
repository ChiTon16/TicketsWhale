package com.tonz.ticketingservice.repository;

import com.tonz.ticketingservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByUserId(UUID userId);

    // Tìm các booking PENDING đã hết hạn để tự động hủy
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.expiresAt < :now")
    List<Booking> findExpiredBookings(LocalDateTime now);

    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);
}