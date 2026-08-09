package com.phongtro247.housing.modules.transactions.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TransactionResponse(
        Long id,
        String date,
        String type,
        BigDecimal amount,
        String description,
        String status,
        Instant createdAt
) {
}
