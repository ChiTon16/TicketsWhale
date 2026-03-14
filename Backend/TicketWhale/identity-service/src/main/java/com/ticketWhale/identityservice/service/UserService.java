package com.ticketWhale.identityservice.service;

import com.ticketWhale.identityservice.dto.request.LoginRequest;
import com.ticketWhale.identityservice.dto.request.RegisterRequest;
import com.ticketWhale.identityservice.dto.response.AuthResponse;
import com.ticketWhale.identityservice.dto.response.UserResponse;
import com.ticketWhale.identityservice.entity.User;
import com.ticketWhale.identityservice.exception.AppException;
import com.ticketWhale.identityservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "Email " + request.getEmail() + " đã được sử dụng"
            );
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // ← BCrypt hash
                .fullName(request.getFullName())
                .role(User.Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        return toUserResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "Email hoặc mật khẩu không đúng"
                ));

        // So sánh password với BCrypt hash trong DB
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "Email hoặc mật khẩu không đúng"  // ← Không tiết lộ cụ thể lỗi nào
            );
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
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