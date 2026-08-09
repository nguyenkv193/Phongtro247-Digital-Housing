package com.phongtro247.housing.modules.reviews.service;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import com.phongtro247.housing.modules.listings.repository.ListingRepository;
import com.phongtro247.housing.modules.reviews.dto.CreateReviewRequest;
import com.phongtro247.housing.modules.reviews.dto.ReviewResponse;
import com.phongtro247.housing.modules.reviews.dto.ReviewSummary;
import com.phongtro247.housing.modules.reviews.entity.ReviewEntity;
import com.phongtro247.housing.modules.reviews.repository.ReviewRepository;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.modules.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ListingRepository listingRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ReviewSummary forListing(Long listingId) {
        List<ReviewResponse> reviews = reviewRepository.findByListing_IdOrderByCreatedAtDesc(listingId)
                .stream().map(this::toResponse).toList();
        double average = reviews.stream().mapToInt(ReviewResponse::rating).average().orElse(0);
        return new ReviewSummary(reviews, Math.round(average * 10.0) / 10.0, reviews.size());
    }

    @Transactional
    public ActionResponse create(AuthenticatedUser principal, CreateReviewRequest request) {
        ListingEntity listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new NotFoundException("Listing", request.listingId()));
        if (listing.getOwner() != null && listing.getOwner().getId().equals(principal.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, MessageCatalog.ERR_OWNER_REVIEW_FORBIDDEN);
        }
        if (reviewRepository.existsByListing_IdAndUser_Id(request.listingId(), principal.id())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_REVIEW_EXISTS);
        }
        UserEntity user = userRepository.getReferenceById(principal.id());
        reviewRepository.save(new ReviewEntity(listing, user, request.rating(), request.comment()));
        return ActionResponse.success(MessageCatalog.SUC_REVIEW_CREATED);
    }

    @Transactional
    public ActionResponse delete(AuthenticatedUser principal, Long reviewId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review", reviewId));
        boolean isOwner = review.getListing().getOwner() != null
                && review.getListing().getOwner().getId().equals(principal.id());
        if (!review.getUser().getId().equals(principal.id()) && !isOwner) {
            throw new ApiException(HttpStatus.FORBIDDEN, MessageCatalog.ERR_REVIEW_DELETE_FORBIDDEN);
        }
        reviewRepository.delete(review);
        return ActionResponse.success(MessageCatalog.SUC_REVIEW_DELETED);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> forMyListings(AuthenticatedUser principal) {
        return reviewRepository.findByListing_Owner_IdOrderByCreatedAtDesc(principal.id())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> forUser(AuthenticatedUser principal) {
        return reviewRepository.findByUser_IdOrderByCreatedAtDesc(principal.id())
                .stream().map(this::toResponse).toList();
    }

    private ReviewResponse toResponse(ReviewEntity review) {
        return new ReviewResponse(
                review.getId(), review.getRating(), review.getComment(), review.getCreatedAt(),
                review.getUser() == null ? null : review.getUser().getFullName(),
                review.getUser() == null ? null : review.getUser().getAvatar(),
                review.getUser() == null ? null : review.getUser().getId(),
                review.getListing() == null ? null : review.getListing().getId(),
                review.getListing() == null ? null : review.getListing().getName());
    }
}
