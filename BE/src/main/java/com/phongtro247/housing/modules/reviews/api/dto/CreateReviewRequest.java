package com.phongtro247.housing.modules.reviews.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateReviewRequest(
        @NotNull @JsonAlias("listing_id") Long listingId,
        @Min(1) @Max(5) int rating,
        String comment
) {
}
