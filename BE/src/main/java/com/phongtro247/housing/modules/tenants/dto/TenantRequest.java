package com.phongtro247.housing.modules.tenants.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TenantRequest(
        @NotBlank(message = MessageCatalog.VALIDATION_NAME_REQUIRED) String name,
        LocalDate birthday,
        String gender,
        Long wardId,
        String address,
        @NotBlank(message = MessageCatalog.VALIDATION_PHONE_REQUIRED) String phone,
        String email,
        String occupation,
        String cccd,
        String stayStatus,
        @JsonAlias({"ownerId", "owner_id"}) Long ownerId
) {
}
