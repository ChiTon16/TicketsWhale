package com.ticketWhale.identityservice.controller;

import com.ticketWhale.identityservice.dto.request.LoginRequest;
import com.ticketWhale.identityservice.dto.request.RegisterRequest;
import com.ticketWhale.identityservice.dto.response.AuthResponse;
import com.ticketWhale.identityservice.dto.response.UserResponse;
import com.ticketWhale.identityservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    // Request DTO
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                userService.refreshToken(body.get("refreshToken")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody Map<String, String> body) {
        userService.logout(body.get("refreshToken"));
        return ResponseEntity.noContent().build();
    }
}