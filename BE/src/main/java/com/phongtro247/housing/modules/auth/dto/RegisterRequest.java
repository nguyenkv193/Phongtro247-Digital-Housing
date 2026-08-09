package com.phongtro247.housing.modules.auth.dto;

import com.phongtro247.housing.common.message.MessageCatalog;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record RegisterRequest(
        @NotBlank(message = MessageCatalog.VALIDATION_FULL_NAME_REQUIRED) String fullName,
        String email,
        String phone,
        @NotBlank(message = MessageCatalog.VALIDATION_PASSWORD_REQUIRED)
        @Size(min = 8, message = MessageCatalog.VALIDATION_PASSWORD_MIN_LENGTH) String password
) {
}
