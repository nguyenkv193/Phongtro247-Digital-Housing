package com.phongtro247.housing.modules.promotions.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record PromotionRequestResponse(
        Long id,
        Long listingId,
        String listingName,
        String listingAddress,
        String note,
        String status,
        String adminNote,
        Instant createdAt,
        Instant processedAt,
        Boolean hasVideo,
        String videoUrl,
        Integer durationDays,
        BigDecimal fee,
        Instant hotUntil
) {
}
