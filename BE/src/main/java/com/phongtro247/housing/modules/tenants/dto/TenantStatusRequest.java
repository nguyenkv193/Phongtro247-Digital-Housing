package com.phongtro247.housing.modules.tenants.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.NotBlank;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TenantStatusRequest(
        @NotBlank(message = MessageCatalog.VALIDATION_REQUIRED) @JsonAlias({"stayStatus", "stay_status"}) String stayStatus
) {
}
