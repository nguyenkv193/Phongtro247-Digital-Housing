package com.phongtro247.housing.modules.auth.api;

import com.phongtro247.housing.common.api.MessageResponse;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.modules.auth.api.dto.AuthResponse;
import com.phongtro247.housing.modules.auth.api.dto.LoginRequest;
import com.phongtro247.housing.modules.auth.api.dto.RegisterRequest;
import com.phongtro247.housing.modules.auth.application.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return MessageResponse.success(MessageCatalog.SUC_REGISTRATION);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
