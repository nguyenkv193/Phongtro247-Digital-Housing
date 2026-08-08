package com.phongtro247.housing.modules.tenants.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;
import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TenantResponse(
        Long id,
        Long ownerId,
        Long userId,
        String name,
        LocalDate birthday,
        String gender,
        Long wardId,
        String wardName,
        String address,
        String phone,
        String email,
        String occupation,
        String cccd,
        String stayStatus,
        Instant createdAt
) {
}
