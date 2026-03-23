package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.BookingNotificationMessage;
import com.tonz.ticketingservice.dto.request.CreateBookingRequest;
import com.tonz.ticketingservice.dto.response.BookingResponse;
import com.tonz.ticketingservice.dto.response.TicketResponse;
import com.tonz.ticketingservice.entity.*;
import com.tonz.ticketingservice.exception.AppException;
import com.tonz.ticketingservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final MatchRepository matchRepository;
    private final SectionRepository sectionRepository;
    private final NotificationPublisher notificationPublisher;

    @Value("${app.booking.hold-duration-minutes:10}")
    private int holdDurationMinutes;

    @Transactional
    public BookingResponse createBooking(UUID userId, CreateBookingRequest request) {

        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "MATCH_NOT_FOUND", "Trận đấu không tồn tại"));

        if (match.getStatus() != Match.MatchStatus.SCHEDULED) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "MATCH_NOT_AVAILABLE", "Trận đấu không còn nhận đặt vé");
        }

        Section section = sectionRepository.findByIdWithLock(request.getSectionId())
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "SECTION_NOT_FOUND", "Khu vực không tồn tại"));

        if (section.getAvailableSeats() < request.getQuantity()) {
            throw new AppException(HttpStatus.CONFLICT, "INSUFFICIENT_SEATS",
                    "Không đủ vé. Còn lại: " + section.getAvailableSeats());
        }

        section.setAvailableSeats(section.getAvailableSeats() - request.getQuantity());

        BigDecimal totalAmount = section.getPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        Booking booking = Booking.builder()
                .userId(userId)
                .totalAmount(totalAmount)
                .status(Booking.BookingStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(holdDurationMinutes))
                .build();

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < request.getQuantity(); i++) {
            tickets.add(Ticket.builder()
                    .booking(booking)
                    .section(section)
                    .price(section.getPrice())
                    .status(Ticket.TicketStatus.PENDING)
                    .build());
        }
        booking.setTickets(tickets);

        Booking savedBooking = bookingRepository.save(booking);

        notificationPublisher.publishBookingConfirmed(
                BookingNotificationMessage.builder()
                        .bookingId(savedBooking.getId())
                        .userId(userId)
                        .userEmail(request.getUserEmail())
                        .userFullName(request.getUserFullName())
                        .matchName(match.getHomeTeam() + " vs " + match.getAwayTeam())
                        .matchTime(match.getMatchTime().toString())
                        .stadiumName(match.getStadium().getName())
                        .seatTypeName(section.getStand() + " - " + section.getName())
                        .quantity(request.getQuantity())
                        .totalAmount(totalAmount)
                        .eventType("BOOKING_CONFIRMED")
                        .build()
        );

        return toBookingResponse(savedBooking);
    }

    @Transactional
    public void cancelBooking(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Booking không tồn tại"));

        if (!booking.getUserId().equals(userId)) {
            throw new AppException(
                    HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Bạn không có quyền hủy booking này");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST, "CANNOT_CANCEL",
                    "Chỉ có thể hủy booking đang PENDING");
        }

        // Hoàn trả số ghế về section
        Ticket firstTicket = booking.getTickets().get(0);
        if (firstTicket.getSection() != null) {
            Section section = sectionRepository
                    .findByIdWithLock(firstTicket.getSection().getId())
                    .orElseThrow();
            section.setAvailableSeats(
                    section.getAvailableSeats() + booking.getTickets().size());
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.getTickets().forEach(t -> t.setStatus(Ticket.TicketStatus.CANCELLED));

        log.info("Booking cancelled: {}", bookingId);
    }

    public BookingResponse getBooking(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Booking không tồn tại"));

        if (!booking.getUserId().equals(userId)) {
            throw new AppException(
                    HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Không có quyền truy cập");
        }

        return toBookingResponse(booking);
    }

    private BookingResponse toBookingResponse(Booking booking) {
        List<TicketResponse> ticketResponses = booking.getTickets().stream()
                .map(t -> TicketResponse.builder()
                        .id(t.getId())
                        .sectionId(t.getSection() != null
                                ? t.getSection().getId() : null)
                        .sectionName(t.getSection() != null
                                ? t.getSection().getStand() + " - " + t.getSection().getName()
                                : "N/A")
                        .price(t.getPrice())
                        .status(t.getStatus())
                        .build())
                .toList();

        // Lấy match info từ section → match
        BookingResponse.MatchInfo matchInfo = null;
        if (!booking.getTickets().isEmpty()
                && booking.getTickets().get(0).getSection() != null) {

            Section section = booking.getTickets().get(0).getSection();
            Match match = section.getMatch();

            if (match != null) {
                matchInfo = BookingResponse.MatchInfo.builder()
                        .id(match.getId())
                        .homeTeam(match.getHomeTeam())
                        .awayTeam(match.getAwayTeam())
                        .homeCrest(match.getHomeCrest())
                        .awayCrest(match.getAwayCrest())
                        .matchTime(match.getMatchTime())
                        .stadiumName(match.getStadium() != null
                                ? match.getStadium().getName() : null)
                        .build();
            }
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .expiresAt(booking.getExpiresAt())
                .createdAt(booking.getCreatedAt())
                .paidAt(booking.getPaidAt())
                .tickets(ticketResponses)
                .match(matchInfo)          // ← thêm
                .build();
    }

    public List<BookingResponse> getBookingHistory(UUID userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }
}