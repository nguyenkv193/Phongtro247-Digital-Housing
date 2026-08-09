package com.phongtro247.housing.modules.reviews.controller;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.reviews.dto.CreateReviewRequest;
import com.phongtro247.housing.modules.reviews.dto.ReviewResponse;
import com.phongtro247.housing.modules.reviews.dto.ReviewSummary;
import com.phongtro247.housing.modules.reviews.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/listing/{listingId}")
    public DataResponse<ReviewSummary> listing(@PathVariable Long listingId) {
        return DataResponse.of(reviewService.forListing(listingId));
    }

    @PostMapping
    public ActionResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                 @Valid @RequestBody CreateReviewRequest request) {
        return reviewService.create(principal, request);
    }

    @DeleteMapping("/{reviewId}")
    public ActionResponse delete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long reviewId) {
        return reviewService.delete(principal, reviewId);
    }

    @GetMapping("/my-listings")
    public DataResponse<List<ReviewResponse>> myListings(@AuthenticationPrincipal AuthenticatedUser principal) {
        return DataResponse.of(reviewService.forMyListings(principal));
    }

    @GetMapping("/my-reviews")
    public DataResponse<List<ReviewResponse>> myReviews(@AuthenticationPrincipal AuthenticatedUser principal) {
        return DataResponse.of(reviewService.forUser(principal));
    }
}
