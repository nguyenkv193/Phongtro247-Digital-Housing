package com.phongtro247.housing.modules.favorites.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record FavoriteResponse(
        Long favoriteId,
        Instant favoritedAt,
        Long id,
        String name,
        BigDecimal price,
        BigDecimal area,
        String address,
        String street,
        String status,
        boolean isHot,
        Instant createdAt,
        String listingType,
        String typeSlug,
        String location,
        String image,
        String landlordName,
        String landlordPhone
) {
}
