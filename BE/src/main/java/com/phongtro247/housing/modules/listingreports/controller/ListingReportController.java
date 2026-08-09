package com.phongtro247.housing.modules.listingreports.controller;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.listingreports.dto.CreateListingReportRequest;
import com.phongtro247.housing.modules.listingreports.dto.ListingReportResponse;
import com.phongtro247.housing.modules.listingreports.dto.UpdateListingReportRequest;
import com.phongtro247.housing.modules.listingreports.service.ListingReportService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/listing-reports")
public class ListingReportController {

    private final ListingReportService reportService;

    public ListingReportController(ListingReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ActionResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                 @Valid @RequestBody CreateListingReportRequest request) {
        return reportService.create(principal, request);
    }

    @GetMapping("/my-reports")
    public DataResponse<List<ListingReportResponse>> myReports(@AuthenticationPrincipal AuthenticatedUser principal) {
        return reportService.myReports(principal);
    }

    @GetMapping
    public List<ListingReportResponse> allReports() {
        return reportService.allReports();
    }

    @PatchMapping("/{id}")
    public ActionResponse updateStatus(@PathVariable Long id, @RequestBody UpdateListingReportRequest request) {
        return reportService.updateStatus(id, request.status());
    }
}
