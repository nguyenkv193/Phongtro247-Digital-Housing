package com.phongtro247.housing.modules.auth.service;

import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.security.JwtService;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.modules.auth.dto.AuthResponse;
import com.phongtro247.housing.modules.auth.dto.LoginRequest;
import com.phongtro247.housing.modules.auth.dto.RegisterRequest;
import com.phongtro247.housing.modules.auth.dto.UserSummary;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.modules.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (!StringUtils.hasText(request.email()) && !StringUtils.hasText(request.phone())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_CONTACT_REQUIRED);
        }
        if (StringUtils.hasText(request.email()) && userRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_EMAIL_EXISTS);
        }
        if (StringUtils.hasText(request.phone()) && userRepository.existsByPhone(request.phone().trim())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_PHONE_EXISTS);
        }

        UserEntity user = new UserEntity(
                request.fullName().trim(),
                normalize(request.email()),
                normalize(request.phone()),
                passwordEncoder.encode(request.password()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmailOrPhone(request.emailOrPhone().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_ACCOUNT_NOT_FOUND));

        if (user.isBlocked()) {
            throw new ApiException(HttpStatus.FORBIDDEN, MessageCatalog.ERR_ACCOUNT_BLOCKED);
        }
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_INVALID_PASSWORD);
        }

        return new AuthResponse(jwtService.issue(user), new UserSummary(
                user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole()));
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
