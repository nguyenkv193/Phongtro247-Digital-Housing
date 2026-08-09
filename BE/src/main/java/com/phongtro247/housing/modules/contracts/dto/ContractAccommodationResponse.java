package com.phongtro247.housing.modules.contracts.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record ContractAccommodationResponse(
        Long contractId,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal depositPrice,
        BigDecimal rentPrice,
        String note,
        String contractStatus,
        Long listingId,
        String listingName,
        String listingAddress,
        BigDecimal listingPrice,
        BigDecimal listingArea,
        String listingTypeName,
        String landlordName,
        String landlordPhone,
        String landlordEmail
) {
}
