package com.phongtro247.housing.modules.tenants.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TenantSummaryResponse(Long id, String name, String phone) {
}
