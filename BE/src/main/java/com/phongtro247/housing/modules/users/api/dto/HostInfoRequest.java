package com.phongtro247.housing.modules.users.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record HostInfoRequest(
        @NotBlank String fullName,
        @NotBlank String phone,
        String email,
        String address,
        String role
) {
}
