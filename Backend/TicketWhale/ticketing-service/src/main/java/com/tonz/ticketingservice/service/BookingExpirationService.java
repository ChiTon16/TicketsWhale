package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.entity.Booking;
import com.tonz.ticketingservice.entity.SeatType;
import com.tonz.ticketingservice.entity.Ticket;
import com.tonz.ticketingservice.repository.BookingRepository;
import com.tonz.ticketingservice.repository.SeatTypeRepository;
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
    private final SeatTypeRepository seatTypeRepository;

    // Chạy mỗi 1 phút để kiểm tra booking hết hạn
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireBookings() {
        List<Booking> expiredBookings =
                bookingRepository.findExpiredBookings(LocalDateTime.now());

        if (expiredBookings.isEmpty()) return;

        log.info("Found {} expired bookings, processing...", expiredBookings.size());

        for (Booking booking : expiredBookings) {
            // Hoàn trả số vé về pool
            Ticket firstTicket = booking.getTickets().get(0);
            SeatType seatType = seatTypeRepository
                    .findByIdWithLock(firstTicket.getSeatType().getId())
                    .orElseThrow();

            int refundCount = booking.getTickets().size();
            seatType.setAvailableSeats(seatType.getAvailableSeats() + refundCount);

            // Cập nhật trạng thái
            booking.setStatus(Booking.BookingStatus.EXPIRED);
            booking.getTickets().forEach(t -> t.setStatus(Ticket.TicketStatus.CANCELLED));

            log.info("Expired booking: {}, refunded {} seats", booking.getId(), refundCount);
        }
    }
}