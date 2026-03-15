package com.tonz.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.queue.booking-confirmed}")
    private String bookingConfirmedQueue;

    @Value("${app.rabbitmq.queue.booking-cancelled}")
    private String bookingCancelledQueue;

    @Value("${app.rabbitmq.routing-key.booking-confirmed}")
    private String bookingConfirmedKey;

    @Value("${app.rabbitmq.routing-key.booking-cancelled}")
    private String bookingCancelledKey;

    // Exchange — nơi nhận message và route đến queue
    @Bean
    public TopicExchange ticketExchange() {
        return new TopicExchange(exchange);
    }

    // Queues
    @Bean
    public Queue bookingConfirmedQueue() {
        return QueueBuilder.durable(bookingConfirmedQueue).build();
    }

    @Bean
    public Queue bookingCancelledQueue() {
        return QueueBuilder.durable(bookingCancelledQueue).build();
    }

    // Bindings — kết nối Queue với Exchange qua routing key
    @Bean
    public Binding bookingConfirmedBinding() {
        return BindingBuilder
                .bind(bookingConfirmedQueue())
                .to(ticketExchange())
                .with(bookingConfirmedKey);
    }

    @Bean
    public Binding bookingCancelledBinding() {
        return BindingBuilder
                .bind(bookingCancelledQueue())
                .to(ticketExchange())
                .with(bookingCancelledKey);
    }

    // Dùng JSON để serialize/deserialize message
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}