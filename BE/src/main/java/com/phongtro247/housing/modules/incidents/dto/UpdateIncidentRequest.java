package com.phongtro247.housing.modules.incidents.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record UpdateIncidentRequest(
        String status,
        @JsonAlias({"adminResponse", "admin_response"}) String adminResponse
) {
}
