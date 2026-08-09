package com.phongtro247.housing.modules.landlordreports.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ExpenseItemResponse(
        Long id,
        BigDecimal amount,
        String date,
        String type,
        String category,
        String listingName,
        String tenantName,
        String createdAt
) {
}
