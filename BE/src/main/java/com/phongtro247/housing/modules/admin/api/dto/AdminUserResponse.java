package com.phongtro247.housing.modules.admin.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        boolean hasCompletedHostInfo,
        boolean verified,
        boolean isBlocked
) {
}
