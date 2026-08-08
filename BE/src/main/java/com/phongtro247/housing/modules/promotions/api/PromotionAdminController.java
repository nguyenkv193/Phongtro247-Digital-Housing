package com.phongtro247.housing.modules.promotions.api;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.promotions.api.dto.AdminPromotionRequestResponse;
import com.phongtro247.housing.modules.promotions.api.dto.PromotionAdminDecisionRequest;
import com.phongtro247.housing.modules.promotions.application.PromotionAdminService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PromotionAdminController {

    private final PromotionAdminService promotionAdminService;

    public PromotionAdminController(PromotionAdminService promotionAdminService) {
        this.promotionAdminService = promotionAdminService;
    }

    @GetMapping({"/api/videos/all-requests", "/api/videos/admin-requests"})
    public DataResponse<List<AdminPromotionRequestResponse>> all(@RequestParam(required = false) String status) {
        return promotionAdminService.all(status);
    }

    @PostMapping("/api/videos/approve-video/{id}")
    public ActionResponse approveVideo(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id,
                                       @RequestBody PromotionAdminDecisionRequest request) {
        return promotionAdminService.approveVideo(principal, id, request.videoUrl(), request.adminNote());
    }

    @PostMapping("/api/videos/reject-video/{id}")
    public ActionResponse rejectVideo(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id,
                                      @RequestBody PromotionAdminDecisionRequest request) {
        return promotionAdminService.rejectVideo(principal, id, request.adminNote());
    }

    @DeleteMapping("/api/videos/remove/{listingId}")
    public ActionResponse removeVideo(@PathVariable Long listingId) {
        return promotionAdminService.removeVideo(listingId);
    }

    @GetMapping("/api/hot-listings/admin/requests")
    public DataResponse<List<AdminPromotionRequestResponse>> allHot(@RequestParam(required = false) String status) {
        return promotionAdminService.all(status);
    }

    @PostMapping("/api/hot-listings/admin/approve/{id}")
    public ActionResponse approveHot(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id,
                                     @RequestBody PromotionAdminDecisionRequest request) {
        return promotionAdminService.approveHot(principal, id, request.adminNote());
    }

    @PostMapping("/api/hot-listings/admin/reject/{id}")
    public ActionResponse rejectHot(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id,
                                    @RequestBody PromotionAdminDecisionRequest request) {
        return promotionAdminService.rejectHot(principal, id, request.adminNote());
    }
}
