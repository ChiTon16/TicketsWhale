package com.tonz.ticketingservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ID của user từ Identity Service
    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // Thời điểm hết hạn giữ chỗ (10 phút)
    private LocalDateTime expiresAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<Ticket> tickets;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(unique = true)
    private String paymentCode;    // Mã thanh toán unique

    @Column
    private LocalDateTime paidAt;  // Thời gian thanh toán

    public enum BookingStatus {
        PENDING,    // Đang giữ chỗ, chờ thanh toán
        CONFIRMED,  // Đã thanh toán thành công
        CANCELLED,  // Đã hủy hoặc hết giờ giữ chỗ
        EXPIRED     // Hết 10 phút không thanh toán
    }
}