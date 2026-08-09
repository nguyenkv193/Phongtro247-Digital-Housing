package com.phongtro247.housing.modules.contracts.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ContractRequest(
        @JsonAlias({"tenantId", "tenant_id"}) Long tenantId,
        @NotNull(message = MessageCatalog.VALIDATION_REQUIRED) @JsonAlias({"listingId", "listing_id"}) Long listingId,
        @NotNull(message = MessageCatalog.VALIDATION_REQUIRED) @JsonAlias({"startDate", "start_date"}) LocalDate startDate,
        @NotNull(message = MessageCatalog.VALIDATION_REQUIRED) @JsonAlias({"endDate", "end_date"}) LocalDate endDate,
        @JsonAlias({"depositPrice", "deposit_price"}) BigDecimal depositPrice,
        @JsonAlias({"rentPrice", "rent_price"}) BigDecimal rentPrice,
        String note
) {
}
