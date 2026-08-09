package com.phongtro247.housing.modules.payments.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PaymentCreateRequest(
        @NotNull(message = MessageCatalog.VALIDATION_REQUIRED)
        @DecimalMin(value = "1000", message = MessageCatalog.VALIDATION_AMOUNT_MINIMUM) BigDecimal amount,
        String orderInfo,
        @JsonAlias({"userId", "user_id"}) Long userId
) {
}
