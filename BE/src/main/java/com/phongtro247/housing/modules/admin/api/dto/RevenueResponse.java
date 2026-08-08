package com.phongtro247.housing.modules.admin.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record RevenueResponse(
        Long id,
        BigDecimal amount,
        boolean isHot,
        Instant createdAt,
        String listingName,
        String ownerName
) {
}
