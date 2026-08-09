package com.phongtro247.housing.modules.contracts.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ContractListingResponse(
        Long id,
        String roomName,
        BigDecimal price,
        String address,
        String listingType,
        Long listingTypeId
) {
}
