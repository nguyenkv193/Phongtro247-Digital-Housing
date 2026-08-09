package com.phongtro247.housing.modules.listings.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ListingCardResponse(
        Long id,
        String title,
        String price,
        BigDecimal rawPrice,
        String area,
        BigDecimal rawArea,
        String location,
        String type,
        String typeSlug,
        String image,
        boolean isHot,
        boolean hasVideo,
        String videoUrl,
        long views,
        Instant createdAt,
        OwnerResponse owner
) {
}
