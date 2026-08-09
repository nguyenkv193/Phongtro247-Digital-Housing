package com.phongtro247.housing.modules.promotions.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record CreateHotListingRequest(
        @NotNull(message = MessageCatalog.VALIDATION_REQUIRED) @JsonAlias({"listingId", "listing_id"}) Long listingId,
        @Min(value = 1, message = MessageCatalog.VALIDATION_DURATION_MINIMUM)
        @Max(value = 365, message = MessageCatalog.VALIDATION_DURATION_MAXIMUM)
        @JsonAlias({"durationDays", "duration_days"}) Integer durationDays,
        String note
) {
}
