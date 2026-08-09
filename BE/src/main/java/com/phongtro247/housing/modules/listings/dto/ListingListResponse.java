package com.phongtro247.housing.modules.listings.dto;

import java.util.List;

public record ListingListResponse(boolean success, List<ListingCardResponse> data, long total) {
}
