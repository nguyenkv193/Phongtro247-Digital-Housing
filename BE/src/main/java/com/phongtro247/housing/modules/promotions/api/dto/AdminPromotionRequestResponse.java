package com.phongtro247.housing.modules.promotions.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record AdminPromotionRequestResponse(
        Long id,
        String requestType,
        Long listingId,
        Long userId,
        String listingName,
        String userName,
        String status,
        String note,
        String adminNote,
        Instant createdAt,
        Instant processedAt,
        Integer durationDays,
        BigDecimal fee,
        Instant hotUntil,
        Boolean hasVideo,
        String videoUrl
) {
}
