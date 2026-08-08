package com.phongtro247.housing.modules.promotions.application;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.listings.domain.ListingEntity;
import com.phongtro247.housing.modules.listings.infrastructure.ListingRepository;
import com.phongtro247.housing.modules.promotions.api.dto.CreateVideoRequest;
import com.phongtro247.housing.modules.promotions.api.dto.PromotionRequestResponse;
import com.phongtro247.housing.modules.promotions.domain.VideoRequestEntity;
import com.phongtro247.housing.modules.promotions.infrastructure.VideoRequestRepository;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import com.phongtro247.housing.modules.users.infrastructure.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VideoRequestService {

    private final VideoRequestRepository videoRequestRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public VideoRequestService(VideoRequestRepository videoRequestRepository, ListingRepository listingRepository,
                               UserRepository userRepository) {
        this.videoRequestRepository = videoRequestRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ActionResponse create(AuthenticatedUser principal, CreateVideoRequest request) {
        ListingEntity listing = ownedPublishedListing(principal, request.listingId());
        if (videoRequestRepository.existsByListing_IdAndStatus(listing.getId(), "pending")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_VIDEO_REQUEST_EXISTS);
        }
        UserEntity user = userRepository.getReferenceById(principal.id());
        videoRequestRepository.save(new VideoRequestEntity(listing, user, request.note()));
        return ActionResponse.success(MessageCatalog.SUC_VIDEO_REQUEST_SUBMITTED);
    }

    @Transactional(readOnly = true)
    public DataResponse<List<PromotionRequestResponse>> myRequests(AuthenticatedUser principal) {
        return DataResponse.of(videoRequestRepository.findByUser_IdOrderByCreatedAtDesc(principal.id()).stream()
                .map(this::toResponse).toList());
    }

    private ListingEntity ownedPublishedListing(AuthenticatedUser principal, Long listingId) {
        ListingEntity listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing", listingId));
        if (listing.getOwner() == null || !listing.getOwner().getId().equals(principal.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, MessageCatalog.ERR_LISTING_ACCESS_DENIED);
        }
        if (!"published".equalsIgnoreCase(listing.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_LISTING_MUST_BE_PUBLISHED);
        }
        return listing;
    }

    private PromotionRequestResponse toResponse(VideoRequestEntity request) {
        ListingEntity listing = request.getListing();
        return new PromotionRequestResponse(request.getId(), listing.getId(), listing.getName(), listing.getAddress(),
                request.getNote(), request.getStatus(), request.getAdminNote(), request.getCreatedAt(),
                request.getProcessedAt(), listing.isHasVideo(), listing.getVideoUrl(), null, null, null);
    }
}
