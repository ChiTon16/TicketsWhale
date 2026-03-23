package com.tonz.ticketingservice.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.tonz.ticketingservice.entity.Booking;
import com.tonz.ticketingservice.exception.AppException;
import com.tonz.ticketingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final BookingRepository bookingRepository;

    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;        // ← ngrok URL → backend callback

    @Value("${vnpay.frontend-url}")
    private String frontendUrl;      // ← Frontend redirect sau khi xong

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    public String createPaymentUrl(UUID bookingId, UUID userId, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND",
                        "Booking không tồn tại"));

        if (!booking.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "ACCESS_DENIED", "Không có quyền truy cập");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "INVALID_STATUS", "Booking không ở trạng thái PENDING");
        }

        if (booking.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "BOOKING_EXPIRED", "Booking đã hết hạn");
        }

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount",
                String.valueOf(booking.getTotalAmount().longValue() * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", bookingId.toString());
        vnpParams.put("vnp_OrderInfo", "Thanh toan ve bong da - " + bookingId);
        vnpParams.put("vnp_OrderType", "entertainment");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);  // ← ngrok callback URL
        vnpParams.put("vnp_IpAddr", ipAddress);
        vnpParams.put("vnp_CreateDate",
                new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        StringBuilder query = new StringBuilder();
        StringBuilder hashData = new StringBuilder();

        vnpParams.forEach((key, value) -> {
            if (!hashData.isEmpty()) {
                hashData.append('&');
                query.append('&');
            }
            hashData.append(key).append('=')
                    .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
            query.append(URLEncoder.encode(key, StandardCharsets.US_ASCII))
                    .append('=')
                    .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
        });

        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = vnpayUrl + "?" + query;
        log.info("Created VNPay payment URL for booking: {}", bookingId);
        return paymentUrl;
    }

    // ← Trả về redirect URL thay vì boolean
    @Transactional
    public String handlePaymentCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        String responseCode = params.get("vnp_ResponseCode");
        String bookingId = params.get("vnp_TxnRef");

        // Xác thực chữ ký
        Map<String, String> signParams = new TreeMap<>(params);
        signParams.remove("vnp_SecureHash");
        signParams.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        signParams.forEach((key, value) -> {
            if (!hashData.isEmpty()) hashData.append('&');
            hashData.append(key).append('=')
                    .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
        });

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());

        if (!calculatedHash.equals(receivedHash)) {
            log.warn("Invalid signature for booking: {}", bookingId);
            return frontendUrl + "?status=failed&bookingId=" + bookingId;
        }

        if (!"00".equals(responseCode)) {
            log.warn("Payment failed for booking: {}, code: {}",
                    bookingId, responseCode);
            return frontendUrl + "?status=failed&bookingId=" + bookingId;
        }

        bookingRepository.findById(UUID.fromString(bookingId))
                .ifPresent(booking -> {
                    booking.setStatus(Booking.BookingStatus.CONFIRMED);
                    booking.setPaidAt(LocalDateTime.now());
                    booking.setPaymentCode(params.get("vnp_TransactionNo"));
                    booking.getTickets().forEach(t ->
                            t.setStatus(
                                    com.tonz.ticketingservice.entity.Ticket.TicketStatus.CONFIRMED));
                    bookingRepository.save(booking);
                    log.info("Payment confirmed for booking: {}", bookingId);
                });

        // ← Redirect về Frontend với status success
        return frontendUrl + "?status=success&bookingId=" + bookingId;
    }

    public String generateQrBase64(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(
                    content, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return Base64.getEncoder()
                    .encodeToString(outputStream.toByteArray());
        } catch (Exception e) {
            log.error("Failed to generate QR", e);
            throw new RuntimeException("Không thể tạo QR code");
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC", e);
        }
    }
}