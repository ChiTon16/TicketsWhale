package com.ticketWhale.identityservice.service;

import com.ticketWhale.identityservice.dto.request.LoginRequest;
import com.ticketWhale.identityservice.dto.request.RegisterRequest;
import com.ticketWhale.identityservice.dto.response.AuthResponse;
import com.ticketWhale.identityservice.dto.response.UserResponse;
import com.ticketWhale.identityservice.entity.RefreshToken;
import com.ticketWhale.identityservice.entity.User;
import com.ticketWhale.identityservice.exception.AppException;
import com.ticketWhale.identityservice.repository.RefreshTokenRepository;
import com.ticketWhale.identityservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository; // ← thêm
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "Email " + request.getEmail() + " đã được sử dụng");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(User.Role.USER)
                .build();

        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng");
        }

        // Revoke tất cả refresh token cũ của user
        refreshTokenRepository.revokeAllByUserId(user.getId());

        String accessToken = jwtService.generateToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken();

        // Lưu refresh token vào DB
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtService.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(refreshTokenStr)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED,
                        "INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ"));

        if (refreshToken.isRevoked()) {
            throw new AppException(HttpStatus.UNAUTHORIZED,
                    "REFRESH_TOKEN_REVOKED", "Refresh token đã bị thu hồi");
        }

        if (refreshToken.isExpired()) {
            throw new AppException(HttpStatus.UNAUTHORIZED,
                    "REFRESH_TOKEN_EXPIRED", "Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        User user = refreshToken.getUser();

        // Revoke token cũ, tạo cặp token mới (rotation)
        refreshToken.setRevoked(true);
        String newAccessToken = jwtService.generateToken(user);
        String newRefreshTokenStr = jwtService.generateRefreshToken();

        RefreshToken newRefreshToken = RefreshToken.builder()
                .token(newRefreshTokenStr)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtService.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        refreshTokenRepository.findByToken(refreshTokenStr)
                .ifPresent(rt -> rt.setRevoked(true));
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}