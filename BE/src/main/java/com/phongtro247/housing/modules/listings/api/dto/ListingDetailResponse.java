package com.phongtro247.housing.modules.listings.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ListingDetailResponse(
        Long id,
        String title,
        String price,
        BigDecimal rawPrice,
        String area,
        BigDecimal rawArea,
        String address,
        String street,
        String location,
        String type,
        String typeSlug,
        List<String> images,
        String image,
        boolean isHot,
        boolean hasVideo,
        String videoUrl,
        long views,
        String description,
        String rules,
        String amenities,
        String surroundings,
        Integer roomCount,
        Instant createdAt,
        OwnerResponse owner
) {
}
