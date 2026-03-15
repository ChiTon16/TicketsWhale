package com.tonz.ticketingservice.controller;

import com.tonz.ticketingservice.dto.request.CreateBookingRequest;
import com.tonz.ticketingservice.dto.response.BookingResponse;
import com.tonz.ticketingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            // Tạm thời nhận userId qua header, sau này API Gateway sẽ inject
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookingService.createBooking(userId, request));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID bookingId) {
        return ResponseEntity.ok(bookingService.getBooking(bookingId, userId));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> cancelBooking(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID bookingId) {
        bookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.noContent().build();
    }
}