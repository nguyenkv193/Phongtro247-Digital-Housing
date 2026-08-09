package com.phongtro247.housing.modules.incidents.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record IncidentResponse(
        Long id,
        String title,
        String description,
        String status,
        Instant createdAt,
        Instant updatedAt,
        String listingName,
        String tenantName,
        String adminResponse
) {
}
