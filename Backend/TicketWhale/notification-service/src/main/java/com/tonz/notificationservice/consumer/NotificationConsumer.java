package com.tonz.notificationservice.consumer;

import com.tonz.notificationservice.dto.BookingNotificationMessage;
import com.tonz.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = "${app.rabbitmq.queue.booking-confirmed}")
    public void handleBookingConfirmed(BookingNotificationMessage message) {
        log.info("Received booking confirmed event: {}", message.getBookingId());
        emailService.sendBookingConfirmation(message);
    }

    @RabbitListener(queues = "${app.rabbitmq.queue.booking-cancelled}")
    public void handleBookingCancelled(BookingNotificationMessage message) {
        log.info("Received booking cancelled event: {}", message.getBookingId());
        emailService.sendBookingCancellation(message);
    }
}