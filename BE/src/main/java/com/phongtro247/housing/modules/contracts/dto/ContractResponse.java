package com.phongtro247.housing.modules.contracts.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ContractResponse(
        Long id,
        Long listingId,
        Long tenantId,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal depositPrice,
        BigDecimal rentPrice,
        String note,
        String status,
        Instant createdAt,
        String tenantName,
        String tenantPhone,
        String roomName,
        String listingTypeName,
        String ownerName
) {
}
