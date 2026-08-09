package com.phongtro247.housing.modules.admin.service;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.modules.admin.dto.AdminDashboardResponse;
import com.phongtro247.housing.modules.admin.dto.AdminListingResponse;
import com.phongtro247.housing.modules.admin.dto.AdminUserResponse;
import com.phongtro247.housing.modules.admin.dto.RevenueResponse;
import com.phongtro247.housing.modules.listingreports.repository.ListingReportRepository;
import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import com.phongtro247.housing.modules.listings.entity.ListingTypeEntity;
import com.phongtro247.housing.modules.listings.repository.ListingRepository;
import com.phongtro247.housing.modules.listings.repository.ListingTypeRepository;
import com.phongtro247.housing.modules.revenues.entity.RevenueEntity;
import com.phongtro247.housing.modules.revenues.repository.RevenueRepository;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.modules.users.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ListingTypeRepository listingTypeRepository;
    private final ListingReportRepository reportRepository;
    private final RevenueRepository revenueRepository;

    public AdminService(UserRepository userRepository, ListingRepository listingRepository,
                        ListingTypeRepository listingTypeRepository, ListingReportRepository reportRepository,
                        RevenueRepository revenueRepository) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.listingTypeRepository = listingTypeRepository;
        this.reportRepository = reportRepository;
        this.revenueRepository = revenueRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> users() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream().map(user -> new AdminUserResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.isCompletedHostInfo(),
                user.isVerified(), user.isBlocked())).toList();
    }

    @Transactional
    public ActionResponse toggleBlock(Long id) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User", id));
        user.setBlocked(!user.isBlocked());
        return ActionResponse.success(user.isBlocked()
                ? MessageCatalog.SUC_ACCOUNT_BLOCKED
                : MessageCatalog.SUC_ACCOUNT_UNBLOCKED);
    }

    @Transactional(readOnly = true)
    public List<AdminListingResponse> listings() {
        return listingRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(listing -> new AdminListingResponse(
                        listing.getId(), listing.getName(), listing.getStatus(), listing.isHot(), listing.getRoomCount(),
                        listing.getAddress(), listing.getListingType() == null ? null : listing.getListingType().getName(),
                        listing.getOwner() == null ? null : listing.getOwner().getFullName()))
                .toList();
    }

    @Transactional
    public ActionResponse updateHotLabel(Long id, boolean hot) {
        ListingEntity listing = listingRepository.findById(id).orElseThrow(() -> new NotFoundException("Listing", id));
        listing.setHot(hot);
        return ActionResponse.success(MessageCatalog.SUC_LISTING_HOT_UPDATED);
    }

    @Transactional
    public ActionResponse updateListingStatus(Long id, String status) {
        ListingEntity listing = listingRepository.findById(id).orElseThrow(() -> new NotFoundException("Listing", id));
        listing.changeStatus(status);
        return ActionResponse.success(MessageCatalog.SUC_LISTING_STATUS_UPDATED);
    }

    @Transactional(readOnly = true)
    public List<RevenueResponse> revenues() {
        return revenueRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toRevenue).toList();
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        BigDecimal totalRevenue = revenueRepository.findAll().stream().map(RevenueEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalListings = listingRepository.count();
        long totalComplaints = reportRepository.count();
        Instant cutoff = Instant.now().minusSeconds(30L * 24L * 60L * 60L);
        long newUsers = userRepository.findAll().stream().filter(user -> user.getCreatedAt().isAfter(cutoff)).count();
        List<AdminDashboardResponse.ListingTypeSummary> types = listingTypeRepository.findAll().stream()
                .map(type -> new AdminDashboardResponse.ListingTypeSummary(type.getId(), type.getName(), countType(type)))
                .toList();
        return new AdminDashboardResponse(totalRevenue, totalListings, totalComplaints, newUsers, types);
    }

    private long countType(ListingTypeEntity type) {
        return listingRepository.countByListingType_Id(type.getId());
    }

    private RevenueResponse toRevenue(RevenueEntity revenue) {
        return new RevenueResponse(revenue.getId(), revenue.getAmount(), revenue.isHot(), revenue.getCreatedAt(),
                revenue.getListing() == null ? null : revenue.getListing().getName(),
                revenue.getUser() == null ? null : revenue.getUser().getFullName());
    }
}
