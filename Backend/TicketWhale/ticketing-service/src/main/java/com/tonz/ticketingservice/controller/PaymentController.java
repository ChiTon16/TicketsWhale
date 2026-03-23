package com.tonz.ticketingservice.controller;

import com.tonz.ticketingservice.entity.Booking;
import com.tonz.ticketingservice.exception.AppException;
import com.tonz.ticketingservice.repository.BookingRepository;
import com.tonz.ticketingservice.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final BookingRepository bookingRepository;

    // Tạo URL thanh toán VNPay
    @PostMapping("/vnpay/{bookingId}")
    public ResponseEntity<Map<String, String>> createPayment(
            @PathVariable UUID bookingId,
            @RequestHeader("X-User-Id") UUID userId,
            HttpServletRequest request) {

        String ipAddress = getClientIp(request);
        String paymentUrl = vnPayService.createPaymentUrl(
                bookingId, userId, ipAddress);

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    // VNPay callback sau khi thanh toán
    @GetMapping("/vnpay/callback")
    public void paymentCallback(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        String redirectUrl = vnPayService.handlePaymentCallback(params);
        response.sendRedirect(redirectUrl);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    // Lấy QR Code vé vào cổng sau khi thanh toán thành công
    @GetMapping("/ticket-qr/{bookingId}")
    public ResponseEntity<Map<String, String>> getTicketQr(
            @PathVariable UUID bookingId,
            @RequestHeader("X-User-Id") UUID userId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND",
                        "Booking không tồn tại"));

        if (!booking.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "ACCESS_DENIED", "Không có quyền truy cập");
        }

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "NOT_CONFIRMED", "Vé chưa được thanh toán");
        }

        // QR chứa thông tin vé để quét tại cổng
        String qrContent = String.format(
                "TICKETWHALE:ENTRY:BOOKING=%s:USER=%s:PAID=%s",
                bookingId,
                userId,
                booking.getPaidAt()
        );

        String qrBase64 = vnPayService.generateQrBase64(qrContent);

        return ResponseEntity.ok(Map.of(
                "qrCode", qrBase64,
                "bookingId", bookingId.toString(),
                "status", "CONFIRMED"
        ));
    }
}