package com.phongtro247.housing.modules.users.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record HostInfoRequest(
        @NotBlank(message = MessageCatalog.VALIDATION_FULL_NAME_REQUIRED) String fullName,
        @NotBlank(message = MessageCatalog.VALIDATION_PHONE_REQUIRED) String phone,
        String email,
        String address,
        String role
) {
}
