package com.phongtro247.housing.modules.listingreports.application;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.listingreports.api.dto.CreateListingReportRequest;
import com.phongtro247.housing.modules.listingreports.api.dto.ListingReportResponse;
import com.phongtro247.housing.modules.listingreports.domain.ListingReportEntity;
import com.phongtro247.housing.modules.listingreports.infrastructure.ListingReportRepository;
import com.phongtro247.housing.modules.listings.domain.ListingEntity;
import com.phongtro247.housing.modules.listings.infrastructure.ListingRepository;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import com.phongtro247.housing.modules.users.infrastructure.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ListingReportService {

    private final ListingReportRepository reportRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public ListingReportService(ListingReportRepository reportRepository, ListingRepository listingRepository,
                                UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ActionResponse create(AuthenticatedUser principal, CreateListingReportRequest request) {
        ListingEntity listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new NotFoundException("Listing", request.listingId()));
        if (reportRepository.existsByReporter_IdAndListing_IdAndStatus(principal.id(), request.listingId(), "pending")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_REPORT_EXISTS);
        }
        UserEntity reporter = userRepository.getReferenceById(principal.id());
        String reason = request.description() == null || request.description().isBlank()
                ? request.reason() : request.reason() + ": " + request.description();
        reportRepository.save(new ListingReportEntity(listing, reporter, reason));
        return ActionResponse.success(MessageCatalog.SUC_REPORT_SUBMITTED);
    }

    @Transactional(readOnly = true)
    public DataResponse<List<ListingReportResponse>> myReports(AuthenticatedUser principal) {
        return DataResponse.of(reportRepository.findByReporter_IdOrderByCreatedAtDesc(principal.id()).stream()
                .map(this::toResponse).toList());
    }

    @Transactional(readOnly = true)
    public List<ListingReportResponse> allReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ActionResponse updateStatus(Long id, String status) {
        ListingReportEntity report = reportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Listing report", id));
        if (status == null || status.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_STATUS_REQUIRED);
        }
        report.updateStatus(status);
        return ActionResponse.success(MessageCatalog.SUC_REPORT_UPDATED);
    }

    private ListingReportResponse toResponse(ListingReportEntity report) {
        return new ListingReportResponse(report.getId(), report.getListing().getId(), report.getListing().getName(),
                report.getReason(), report.getStatus(), report.getCreatedAt(),
                report.getReporter() == null ? null : report.getReporter().getFullName());
    }
}
