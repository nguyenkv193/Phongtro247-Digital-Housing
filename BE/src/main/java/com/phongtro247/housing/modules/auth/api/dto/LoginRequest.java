package com.phongtro247.housing.modules.auth.api.dto;

import com.phongtro247.housing.common.message.MessageCatalog;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @JsonProperty("emailOrPhone") @NotBlank(message = MessageCatalog.VALIDATION_EMAIL_OR_PHONE_REQUIRED) String emailOrPhone,
        @NotBlank(message = MessageCatalog.VALIDATION_PASSWORD_REQUIRED) String password
) {
}
