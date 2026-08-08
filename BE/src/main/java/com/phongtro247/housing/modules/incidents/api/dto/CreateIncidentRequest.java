package com.phongtro247.housing.modules.incidents.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record CreateIncidentRequest(
        @NotNull @JsonAlias({"listingId", "listing_id"}) Long listingId,
        @NotBlank String reason,
        String description
) {
}
