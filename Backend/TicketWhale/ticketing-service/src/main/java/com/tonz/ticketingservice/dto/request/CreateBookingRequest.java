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

    @NotNull(message = "sectionId không được để trống")
    private UUID sectionId;      // ← chọn block/section

    @Min(value = 1, message = "Số lượng vé phải ít nhất là 1")
    private int quantity;

    private String userEmail;
    private String userFullName;
}