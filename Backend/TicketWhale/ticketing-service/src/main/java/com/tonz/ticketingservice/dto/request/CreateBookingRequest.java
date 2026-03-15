package com.tonz.ticketingservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull(message = "matchId không được để trống")
    private UUID matchId;

    @NotNull(message = "seatTypeId không được để trống")
    private UUID seatTypeId;

    @Min(value = 1, message = "Số lượng vé phải ít nhất là 1")
    private int quantity;

    @NotBlank(message = "Email không được để trống")
    @Email
    private String userEmail;

    @NotBlank(message = "Họ tên không được để trống")
    private String userFullName;
}