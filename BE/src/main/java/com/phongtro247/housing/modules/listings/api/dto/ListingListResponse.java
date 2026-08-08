package com.phongtro247.housing.modules.listings.api.dto;

import java.util.List;

public record ListingListResponse(boolean success, List<ListingCardResponse> data, long total) {
}
