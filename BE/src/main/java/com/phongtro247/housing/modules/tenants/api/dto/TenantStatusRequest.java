package com.phongtro247.housing.modules.tenants.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TenantStatusRequest(
        @NotBlank @JsonAlias({"stayStatus", "stay_status"}) String stayStatus
) {
}
