package com.phongtro247.housing.modules.favorites.api.dto;

import java.util.List;

public record FavoriteListResponse(boolean success, List<FavoriteResponse> data, long total) {
}
