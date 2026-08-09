package com.phongtro247.housing.modules.listingreports.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ListingReportResponse(
        Long id,
        Long listingId,
        String listingName,
        String reason,
        String status,
        Instant createdAt,
        String reporterName
) {
}
