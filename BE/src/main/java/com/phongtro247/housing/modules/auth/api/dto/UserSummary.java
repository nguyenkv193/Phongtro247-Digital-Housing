package com.phongtro247.housing.modules.auth.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record UserSummary(Long id, String fullName, String email, String phone, String role) {
}
