package com.phongtro247.housing.modules.promotions.service;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import com.phongtro247.housing.modules.listings.repository.ListingRepository;
import com.phongtro247.housing.modules.promotions.dto.CreateHotListingRequest;
import com.phongtro247.housing.modules.promotions.dto.PromotionRequestResponse;
import com.phongtro247.housing.modules.promotions.entity.HotListingRequestEntity;
import com.phongtro247.housing.modules.promotions.repository.HotListingRequestRepository;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.modules.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class HotListingRequestService {

    private static final BigDecimal BASE_FEE_30_DAYS = BigDecimal.valueOf(300_000);

    private final HotListingRequestRepository hotRequestRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public HotListingRequestService(HotListingRequestRepository hotRequestRepository,
                                    ListingRepository listingRepository, UserRepository userRepository) {
        this.hotRequestRepository = hotRequestRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ActionResponse create(AuthenticatedUser principal, CreateHotListingRequest request) {
        ListingEntity listing = ownedPublishedListing(principal, request.listingId());
        if (hotRequestRepository.existsByListing_IdAndStatus(listing.getId(), "pending")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_HOT_REQUEST_EXISTS);
        }
        if (listing.getHotUntil() != null && Duration.between(Instant.now(), listing.getHotUntil()).toDays() > 3) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_LISTING_ALREADY_HOT);
        }
        int durationDays = request.durationDays() == null ? 30 : request.durationDays();
        BigDecimal fee = BASE_FEE_30_DAYS.multiply(BigDecimal.valueOf(durationDays))
                .divide(BigDecimal.valueOf(30));
        UserEntity user = userRepository.getReferenceById(principal.id());
        hotRequestRepository.save(new HotListingRequestEntity(listing, user, durationDays, fee, request.note()));
        return ActionResponse.success(MessageCatalog.SUC_HOT_REQUEST_SUBMITTED);
    }

    @Transactional(readOnly = true)
    public DataResponse<List<PromotionRequestResponse>> myRequests(AuthenticatedUser principal) {
        return DataResponse.of(hotRequestRepository.findByUser_IdOrderByCreatedAtDesc(principal.id()).stream()
                .map(this::toResponse).toList());
    }

    @Transactional
    public ActionResponse cancel(AuthenticatedUser principal, Long id) {
        HotListingRequestEntity request = hotRequestRepository.findByIdAndUser_IdAndStatus(id, principal.id(), "pending")
                .orElseThrow(() -> new NotFoundException("Hot listing request", id));
        hotRequestRepository.delete(request);
        return ActionResponse.success(MessageCatalog.SUC_HOT_REQUEST_CANCELLED);
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

    private PromotionRequestResponse toResponse(HotListingRequestEntity request) {
        ListingEntity listing = request.getListing();
        return new PromotionRequestResponse(request.getId(), listing.getId(), listing.getName(), listing.getAddress(),
                request.getNote(), request.getStatus(), request.getAdminNote(), request.getCreatedAt(),
                request.getProcessedAt(), listing.isHasVideo(), listing.getVideoUrl(), request.getDurationDays(),
                request.getFee(), request.getHotUntil());
    }
}
