package com.phongtro247.housing.modules.payments.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PaymentCreateRequest(
        @NotNull @DecimalMin("1000") BigDecimal amount,
        String orderInfo,
        @JsonAlias({"userId", "user_id"}) Long userId
) {
}
