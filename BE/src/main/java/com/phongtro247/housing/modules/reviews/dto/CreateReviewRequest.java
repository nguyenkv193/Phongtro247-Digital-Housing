package com.phongtro247.housing.modules.reviews.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateReviewRequest(
        @NotNull(message = MessageCatalog.VALIDATION_REQUIRED) @JsonAlias("listing_id") Long listingId,
        @Min(value = 1, message = MessageCatalog.VALIDATION_RATING_MINIMUM)
        @Max(value = 5, message = MessageCatalog.VALIDATION_RATING_MAXIMUM) int rating,
        String comment
) {
}
