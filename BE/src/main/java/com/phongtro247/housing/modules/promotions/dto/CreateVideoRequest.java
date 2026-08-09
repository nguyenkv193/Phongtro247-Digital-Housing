package com.phongtro247.housing.modules.promotions.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.NotNull;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record CreateVideoRequest(
        @NotNull(message = MessageCatalog.VALIDATION_REQUIRED) @JsonAlias({"listingId", "listing_id"}) Long listingId,
        String note
) {
}
