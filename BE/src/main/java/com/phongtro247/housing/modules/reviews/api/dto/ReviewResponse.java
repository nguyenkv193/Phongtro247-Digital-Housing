package com.phongtro247.housing.modules.reviews.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ReviewResponse(
        Long id,
        int rating,
        String comment,
        Instant createdAt,
        String userName,
        String avatar,
        Long userId,
        Long listingId,
        String listingName
) {
}
