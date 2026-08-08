package com.phongtro247.housing.modules.landlordreports.api.dto;

import java.math.BigDecimal;

public record LandlordReportResponse(
        Rooms rooms,
        Tenants tenants,
        Contracts contracts,
        Finance finance
) {
    public record Rooms(long total, long rented, long empty) { }
    public record Tenants(long total) { }
    public record Contracts(long expiring) { }
    public record Finance(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal profit) { }
}
