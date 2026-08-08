package com.phongtro247.housing.modules.admin.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardResponse(
        BigDecimal totalRevenue,
        long totalListings,
        long totalComplaints,
        long newUsers30d,
        List<ListingTypeSummary> listingTypes
) {
    public record ListingTypeSummary(Long id, String name, long count) { }
}
