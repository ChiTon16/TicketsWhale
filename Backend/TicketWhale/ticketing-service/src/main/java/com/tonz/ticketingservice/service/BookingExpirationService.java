package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.entity.Booking;
import com.tonz.ticketingservice.entity.Section;
import com.tonz.ticketingservice.entity.Ticket;
import com.tonz.ticketingservice.repository.BookingRepository;
import com.tonz.ticketingservice.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingExpirationService {

    private final BookingRepository bookingRepository;
    private final SectionRepository sectionRepository;

    // Chạy mỗi 1 phút để kiểm tra booking hết hạn
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireBookings() {
        List<Booking> expiredBookings =
                bookingRepository.findExpiredBookings(LocalDateTime.now());

        if (expiredBookings.isEmpty()) return;

        for (Booking booking : expiredBookings) {
            Ticket firstTicket = booking.getTickets().get(0);

            // ← Kiểm tra section hoặc seatType
            if (firstTicket.getSection() != null) {
                Section section = sectionRepository
                        .findByIdWithLock(firstTicket.getSection().getId())
                        .orElseThrow();
                section.setAvailableSeats(
                        section.getAvailableSeats() + booking.getTickets().size());
            }

            booking.setStatus(Booking.BookingStatus.EXPIRED);
            booking.getTickets().forEach(t -> t.setStatus(Ticket.TicketStatus.CANCELLED));

            log.info("Expired booking: {}", booking.getId());
        }
    }
}