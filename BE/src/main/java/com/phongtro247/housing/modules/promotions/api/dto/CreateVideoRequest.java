package com.phongtro247.housing.modules.promotions.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record CreateVideoRequest(
        @NotNull @JsonAlias({"listingId", "listing_id"}) Long listingId,
        String note
) {
}
