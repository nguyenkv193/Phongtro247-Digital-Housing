package com.phongtro247.housing.modules.listings.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.util.List;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record UpdateListingRequest(
        String name,
        @JsonAlias({"roomCount", "room_count"}) Integer roomCount,
        BigDecimal area,
        BigDecimal price,
        String address,
        String street,
        String description,
        String rules,
        List<String> amenities,
        List<String> surroundings,
        @JsonAlias({"isHot", "is_hot"}) Boolean isHot,
        String status
) {
}
