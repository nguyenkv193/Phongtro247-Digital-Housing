package com.phongtro247.housing.modules.reviews.api.dto;

import java.util.List;

public record ReviewSummary(List<ReviewResponse> reviews, double avgRating, long totalReviews) {
}
