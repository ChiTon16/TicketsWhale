package com.ticketWhale.identityservice.dto.response;

import com.ticketWhale.identityservice.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private User.Role role;
}