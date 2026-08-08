package com.phongtro247.housing.modules.admin.api;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.modules.admin.api.dto.AdminDashboardResponse;
import com.phongtro247.housing.modules.admin.api.dto.AdminListingResponse;
import com.phongtro247.housing.modules.admin.api.dto.AdminUserResponse;
import com.phongtro247.housing.modules.admin.api.dto.RevenueResponse;
import com.phongtro247.housing.modules.admin.api.dto.UpdateHotLabelRequest;
import com.phongtro247.housing.modules.admin.api.dto.UpdateListingStatusRequest;
import com.phongtro247.housing.modules.admin.application.AdminService;
import com.phongtro247.housing.modules.listingreports.api.dto.ListingReportResponse;
import com.phongtro247.housing.modules.listingreports.api.dto.UpdateListingReportRequest;
import com.phongtro247.housing.modules.listingreports.application.ListingReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ListingReportService listingReportService;

    public AdminController(AdminService adminService, ListingReportService listingReportService) {
        this.adminService = adminService;
        this.listingReportService = listingReportService;
    }

    @GetMapping("/users")
    public List<AdminUserResponse> users() { return adminService.users(); }

    @PatchMapping("/users/{id}/block")
    public ActionResponse toggleBlock(@PathVariable Long id) { return adminService.toggleBlock(id); }

    @GetMapping("/adminlistings")
    public List<AdminListingResponse> listings() { return adminService.listings(); }

    @PutMapping("/adminlistings/{id}")
    public ActionResponse updateHotLabel(@PathVariable Long id, @RequestBody UpdateHotLabelRequest request) {
        return adminService.updateHotLabel(id, request.isHot());
    }

    @PutMapping("/adminlistings/{id}/status")
    public ActionResponse updateListingStatus(@PathVariable Long id, @RequestBody UpdateListingStatusRequest request) {
        return adminService.updateListingStatus(id, request.status());
    }

    @GetMapping("/revenues")
    public List<RevenueResponse> revenues() { return adminService.revenues(); }

    @GetMapping("/reports")
    public AdminDashboardResponse dashboard() { return adminService.dashboard(); }

    @GetMapping("/complaints")
    public List<ListingReportResponse> complaints() { return listingReportService.allReports(); }

    @PutMapping("/complaints/{id}")
    public ActionResponse updateComplaint(@PathVariable Long id, @RequestBody UpdateListingReportRequest request) {
        return listingReportService.updateStatus(id, request.status());
    }
}
