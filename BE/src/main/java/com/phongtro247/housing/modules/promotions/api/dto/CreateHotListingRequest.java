package com.phongtro247.housing.modules.promotions.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record CreateHotListingRequest(
        @NotNull @JsonAlias({"listingId", "listing_id"}) Long listingId,
        @Min(1) @Max(365) @JsonAlias({"durationDays", "duration_days"}) Integer durationDays,
        String note
) {
}
