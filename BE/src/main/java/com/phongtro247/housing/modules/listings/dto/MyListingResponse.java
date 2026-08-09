package com.phongtro247.housing.modules.listings.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record MyListingResponse(
        Long id,
        String name,
        BigDecimal price,
        BigDecimal area,
        String address,
        String status,
        boolean isHot,
        boolean hasVideo,
        String videoUrl,
        long views,
        Instant createdAt,
        String typeName,
        String mainImage
) {
}
