package com.phongtro247.housing.modules.promotions.application;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.notifications.domain.NotificationEntity;
import com.phongtro247.housing.modules.notifications.infrastructure.NotificationRepository;
import com.phongtro247.housing.modules.listings.infrastructure.ListingRepository;
import com.phongtro247.housing.modules.promotions.api.dto.AdminPromotionRequestResponse;
import com.phongtro247.housing.modules.promotions.domain.HotListingRequestEntity;
import com.phongtro247.housing.modules.promotions.domain.VideoRequestEntity;
import com.phongtro247.housing.modules.promotions.infrastructure.HotListingRequestRepository;
import com.phongtro247.housing.modules.promotions.infrastructure.VideoRequestRepository;
import com.phongtro247.housing.modules.revenues.domain.RevenueEntity;
import com.phongtro247.housing.modules.revenues.infrastructure.RevenueRepository;
import com.phongtro247.housing.modules.transactions.domain.TransactionEntity;
import com.phongtro247.housing.modules.transactions.infrastructure.TransactionRepository;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import com.phongtro247.housing.modules.users.infrastructure.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PromotionAdminService {

    private static final BigDecimal VIDEO_FEE = BigDecimal.valueOf(500_000);

    private final VideoRequestRepository videoRequestRepository;
    private final HotListingRequestRepository hotRequestRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final RevenueRepository revenueRepository;
    private final NotificationRepository notificationRepository;
    private final ListingRepository listingRepository;

    public PromotionAdminService(VideoRequestRepository videoRequestRepository,
                                 HotListingRequestRepository hotRequestRepository, UserRepository userRepository,
                                 TransactionRepository transactionRepository, RevenueRepository revenueRepository,
                                 NotificationRepository notificationRepository, ListingRepository listingRepository) {
        this.videoRequestRepository = videoRequestRepository;
        this.hotRequestRepository = hotRequestRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.revenueRepository = revenueRepository;
        this.notificationRepository = notificationRepository;
        this.listingRepository = listingRepository;
    }

    @Transactional(readOnly = true)
    public DataResponse<List<AdminPromotionRequestResponse>> all(String status) {
        List<AdminPromotionRequestResponse> items = new ArrayList<>();
        videoRequestRepository.findAll().stream()
                .filter(request -> status == null || "all".equalsIgnoreCase(status) || status.equalsIgnoreCase(request.getStatus()))
                .map(this::toVideoResponse).forEach(items::add);
        hotRequestRepository.findAll().stream()
                .filter(request -> status == null || "all".equalsIgnoreCase(status) || status.equalsIgnoreCase(request.getStatus()))
                .map(this::toHotResponse).forEach(items::add);
        items.sort(Comparator.comparing(AdminPromotionRequestResponse::createdAt).reversed());
        return DataResponse.of(items);
    }

    @Transactional
    public ActionResponse approveVideo(AuthenticatedUser principal, Long id, String videoUrl, String adminNote) {
        if (videoUrl == null || videoUrl.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_VIDEO_URL_REQUIRED);
        }
        VideoRequestEntity request = videoRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Video request", id));
        assertPending(request.getStatus());
        UserEntity admin = userRepository.getReferenceById(principal.id());
        UserEntity owner = request.getUser();
        debit(owner, VIDEO_FEE, MessageCatalog.format(MessageCatalog.VIDEO_PAYMENT_DESCRIPTION,
                request.getListing().getId()));
        request.getListing().setVideo(videoUrl);
        request.approve(admin, adminNote == null ? MessageCatalog.VIDEO_APPROVED_NOTE : adminNote);
        transactionRepository.save(new TransactionEntity(owner, "payment", VIDEO_FEE,
                MessageCatalog.format(MessageCatalog.VIDEO_PAYMENT_DESCRIPTION, request.getListing().getId())));
        revenueRepository.save(new RevenueEntity(request.getListing(), owner, VIDEO_FEE, false));
        notificationRepository.save(new NotificationEntity(owner, MessageCatalog.VIDEO_APPROVED_TITLE,
                MessageCatalog.format(MessageCatalog.VIDEO_APPROVED_NOTIFICATION, request.getListing().getId())));
        return ActionResponse.success(MessageCatalog.SUC_VIDEO_APPROVED);
    }

    @Transactional
    public ActionResponse rejectVideo(AuthenticatedUser principal, Long id, String adminNote) {
        VideoRequestEntity request = videoRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Video request", id));
        assertPending(request.getStatus());
        request.reject(userRepository.getReferenceById(principal.id()),
                defaultNote(adminNote, MessageCatalog.VIDEO_REJECTED_NOTE));
        notificationRepository.save(new NotificationEntity(request.getUser(), MessageCatalog.VIDEO_REJECTED_TITLE,
                defaultNote(adminNote, MessageCatalog.VIDEO_REJECTED_NOTIFICATION)));
        return ActionResponse.success(MessageCatalog.SUC_VIDEO_REJECTED);
    }

    @Transactional
    public ActionResponse approveHot(AuthenticatedUser principal, Long id, String adminNote) {
        HotListingRequestEntity request = hotRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hot listing request", id));
        assertPending(request.getStatus());
        UserEntity owner = request.getUser();
        debit(owner, request.getFee(), MessageCatalog.format(MessageCatalog.HOT_PAYMENT_DESCRIPTION,
                request.getListing().getId(), request.getDurationDays()));
        Instant start = request.getListing().getHotUntil() != null
                && request.getListing().getHotUntil().isAfter(Instant.now())
                ? request.getListing().getHotUntil() : Instant.now();
        Instant hotUntil = start.plusSeconds(request.getDurationDays() * 24L * 60L * 60L);
        request.getListing().setHotUntil(hotUntil);
        request.approve(userRepository.getReferenceById(principal.id()),
                defaultNote(adminNote, MessageCatalog.HOT_APPROVED_NOTE), hotUntil);
        transactionRepository.save(new TransactionEntity(owner, "payment", request.getFee(),
                MessageCatalog.format(MessageCatalog.HOT_PAYMENT_DESCRIPTION, request.getListing().getId(),
                        request.getDurationDays())));
        revenueRepository.save(new RevenueEntity(request.getListing(), owner, request.getFee(), true));
        notificationRepository.save(new NotificationEntity(owner, MessageCatalog.HOT_APPROVED_TITLE,
                MessageCatalog.format(MessageCatalog.HOT_APPROVED_NOTIFICATION, request.getListing().getId(),
                        request.getDurationDays())));
        return ActionResponse.success(MessageCatalog.SUC_HOT_APPROVED);
    }

    @Transactional
    public ActionResponse rejectHot(AuthenticatedUser principal, Long id, String adminNote) {
        HotListingRequestEntity request = hotRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hot listing request", id));
        assertPending(request.getStatus());
        request.reject(userRepository.getReferenceById(principal.id()),
                defaultNote(adminNote, MessageCatalog.HOT_REJECTED_NOTE));
        notificationRepository.save(new NotificationEntity(request.getUser(), MessageCatalog.HOT_REJECTED_TITLE,
                defaultNote(adminNote, MessageCatalog.HOT_REJECTED_NOTIFICATION)));
        return ActionResponse.success(MessageCatalog.SUC_HOT_REJECTED);
    }

    @Transactional
    public ActionResponse removeVideo(Long listingId) {
        var listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing", listingId));
        listing.setVideo(null);
        return ActionResponse.success(MessageCatalog.SUC_VIDEO_REMOVED);
    }

    private void debit(UserEntity user, BigDecimal amount, String description) {
        if (user.getBalance().compareTo(amount) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_INSUFFICIENT_BALANCE);
        }
        user.setBalance(user.getBalance().subtract(amount));
    }

    private void assertPending(String status) {
        if (!"pending".equalsIgnoreCase(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_REQUEST_ALREADY_PROCESSED);
        }
    }

    private String defaultNote(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private AdminPromotionRequestResponse toVideoResponse(VideoRequestEntity request) {
        return new AdminPromotionRequestResponse(request.getId(), "video", request.getListing().getId(),
                request.getUser().getId(), request.getListing().getName(), request.getUser().getFullName(), request.getStatus(),
                request.getNote(), request.getAdminNote(), request.getCreatedAt(), request.getProcessedAt(), null, null,
                null, request.getListing().isHasVideo(), request.getListing().getVideoUrl());
    }

    private AdminPromotionRequestResponse toHotResponse(HotListingRequestEntity request) {
        return new AdminPromotionRequestResponse(request.getId(), "hot", request.getListing().getId(),
                request.getUser().getId(), request.getListing().getName(), request.getUser().getFullName(), request.getStatus(),
                request.getNote(), request.getAdminNote(), request.getCreatedAt(), request.getProcessedAt(),
                request.getDurationDays(), request.getFee(), request.getHotUntil(), request.getListing().isHasVideo(),
                request.getListing().getVideoUrl());
    }
}
