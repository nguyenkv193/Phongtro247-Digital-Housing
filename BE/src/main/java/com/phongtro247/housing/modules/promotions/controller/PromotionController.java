package com.phongtro247.housing.modules.promotions.controller;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.promotions.dto.CreateHotListingRequest;
import com.phongtro247.housing.modules.promotions.dto.CreateVideoRequest;
import com.phongtro247.housing.modules.promotions.dto.PromotionRequestResponse;
import com.phongtro247.housing.modules.promotions.service.HotListingRequestService;
import com.phongtro247.housing.modules.promotions.service.VideoRequestService;
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
public class PromotionController {

    private final VideoRequestService videoRequestService;
    private final HotListingRequestService hotListingRequestService;

    public PromotionController(VideoRequestService videoRequestService, HotListingRequestService hotListingRequestService) {
        this.videoRequestService = videoRequestService;
        this.hotListingRequestService = hotListingRequestService;
    }

    @PostMapping("/api/videos/request")
    public ActionResponse requestVideo(@AuthenticationPrincipal AuthenticatedUser principal,
                                       @Valid @RequestBody CreateVideoRequest request) {
        return videoRequestService.create(principal, request);
    }

    @GetMapping("/api/videos/my-requests")
    public DataResponse<List<PromotionRequestResponse>> myVideoRequests(@AuthenticationPrincipal AuthenticatedUser principal) {
        return videoRequestService.myRequests(principal);
    }

    @PostMapping("/api/hot-listings/request")
    public ActionResponse requestHotListing(@AuthenticationPrincipal AuthenticatedUser principal,
                                            @Valid @RequestBody CreateHotListingRequest request) {
        return hotListingRequestService.create(principal, request);
    }

    @GetMapping("/api/hot-listings/my-requests")
    public DataResponse<List<PromotionRequestResponse>> myHotRequests(@AuthenticationPrincipal AuthenticatedUser principal) {
        return hotListingRequestService.myRequests(principal);
    }

    @DeleteMapping("/api/hot-listings/request/{id}")
    public ActionResponse cancelHotListing(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        return hotListingRequestService.cancel(principal, id);
    }
}
