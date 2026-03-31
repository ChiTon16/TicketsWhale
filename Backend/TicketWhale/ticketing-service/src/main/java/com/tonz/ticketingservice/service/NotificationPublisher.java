package com.tonz.ticketingservice.service;

import com.tonz.ticketingservice.dto.BookingNotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key.booking-confirmed}")
    private String bookingConfirmedKey;

    @Value("${app.rabbitmq.routing-key.booking-cancelled}")
    private String bookingCancelledKey;

    public void publishBookingConfirmed(BookingNotificationMessage message) {
        try {
            rabbitTemplate.convertAndSend(exchange, bookingConfirmedKey, message);
            log.info("Published booking confirmed event: {}", message.getBookingId());
        } catch (Exception e) {
            log.error("Failed to publish booking confirmed", e);
        }
    }

    public void publishBookingCancelled(BookingNotificationMessage message) {
        rabbitTemplate.convertAndSend(exchange, bookingCancelledKey, message);
        log.info("Published booking cancelled event: {}", message.getBookingId());
    }
}