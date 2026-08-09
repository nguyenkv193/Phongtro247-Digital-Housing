package com.phongtro247.housing.modules.admin.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record AdminListingResponse(
        Long id,
        String name,
        String status,
        boolean isHot,
        Integer roomCount,
        String address,
        String listingTypeName,
        String ownerName
) {
}
