package com.phongtro247.housing.modules.tenants.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TenantRequest(
        @NotBlank String name,
        LocalDate birthday,
        String gender,
        Long wardId,
        String address,
        @NotBlank String phone,
        String email,
        String occupation,
        String cccd,
        String stayStatus,
        @JsonAlias({"ownerId", "owner_id"}) Long ownerId
) {
}
