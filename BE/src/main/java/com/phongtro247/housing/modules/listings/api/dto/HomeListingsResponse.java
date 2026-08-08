package com.phongtro247.housing.modules.listings.api.dto;

import java.util.List;
import java.util.Map;

public record HomeListingsResponse(boolean success, Map<String, List<ListingCardResponse>> data) {
}
