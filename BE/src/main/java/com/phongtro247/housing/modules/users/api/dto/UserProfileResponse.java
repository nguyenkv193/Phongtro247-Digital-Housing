package com.phongtro247.housing.modules.users.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record UserProfileResponse(
        Long id,
        String fullName,
        String gender,
        LocalDate birthday,
        String cccd,
        String phone,
        String email,
        String address,
        String avatar,
        String role,
        boolean hasCompletedHostInfo,
        BigDecimal balance,
        Instant createdAt
) {
}
