package com.phongtro247.housing.modules.listings.controller;

import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.listings.dto.MyListingResponse;
import com.phongtro247.housing.modules.listings.dto.UpdateListingRequest;
import com.phongtro247.housing.modules.listings.service.ListingWriteService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.phongtro247.housing.modules.listings.dto.HomeListingsResponse;
import com.phongtro247.housing.modules.listings.dto.ListingDetailResponse;
import com.phongtro247.housing.modules.listings.dto.ListingListResponse;
import com.phongtro247.housing.modules.listings.dto.LocationStatResponse;
import com.phongtro247.housing.modules.listings.service.ListingQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingQueryService listingQueryService;
    private final ListingWriteService listingWriteService;

    public ListingController(ListingQueryService listingQueryService, ListingWriteService listingWriteService) {
        this.listingQueryService = listingQueryService;
        this.listingWriteService = listingWriteService;
    }

    @GetMapping("/home")
    public HomeListingsResponse home() {
        return listingQueryService.home();
    }

    @GetMapping("/hot")
    public ListingListResponse hot(@RequestParam(defaultValue = "10") Integer limit) {
        return listingQueryService.search(null, true, null, null, null, null, null, "newest", null, limit);
    }

    @GetMapping("/by-type")
    public ListingListResponse byType(@RequestParam(required = false, name = "type_slug") String typeSlug,
                                      @RequestParam(required = false, name = "min_price") BigDecimal minPrice,
                                      @RequestParam(required = false, name = "max_price") BigDecimal maxPrice,
                                      @RequestParam(required = false, name = "min_area") BigDecimal minArea,
                                      @RequestParam(required = false, name = "max_area") BigDecimal maxArea,
                                      @RequestParam(required = false, name = "location_id") Long locationId,
                                      @RequestParam(required = false, name = "sort_by") String sortBy,
                                      @RequestParam(required = false, name = "is_hot") Boolean isHot,
                                      @RequestParam(required = false, name = "has_video") Boolean hasVideo,
                                      @RequestParam(defaultValue = "50") Integer limit) {
        return listingQueryService.search(typeSlug, isHot, minPrice, maxPrice, minArea, maxArea,
                locationId, sortBy, hasVideo, limit);
    }

    @GetMapping("/videos")
    public ListingListResponse videos(@RequestParam(defaultValue = "20") Integer limit) {
        return listingQueryService.search(null, null, null, null, null, null, null, "newest", true, limit);
    }

    @GetMapping("/location-stats")
    public DataResponse<List<LocationStatResponse>> locationStats() {
        return listingQueryService.locationStats();
    }

    @GetMapping("/{id}")
    public DataResponse<ListingDetailResponse> detail(@PathVariable Long id) {
        return DataResponse.of(listingQueryService.detail(id));
    }

    @GetMapping("/my-listings")
    public DataResponse<List<MyListingResponse>> myListings(@AuthenticationPrincipal AuthenticatedUser principal,
                                                            @RequestParam(required = false) String status,
                                                            @RequestParam(defaultValue = "20") Integer limit,
                                                            @RequestParam(defaultValue = "0") Integer offset) {
        return listingWriteService.myListings(principal, status, limit, offset);
    }

    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public DataResponse<MyListingResponse> create(@AuthenticationPrincipal AuthenticatedUser principal,
                                                 @RequestParam String listingType,
                                                 @RequestParam String name,
                                                 @RequestParam(required = false) Integer roomCount,
                                                 @RequestParam BigDecimal area,
                                                 @RequestParam(required = false) Long locationId,
                                                 @RequestParam(required = false) String street,
                                                 @RequestParam(required = false) String address,
                                                 @RequestParam BigDecimal price,
                                                 @RequestParam(required = false) String amenities,
                                                 @RequestParam(required = false) String surroundings,
                                                 @RequestParam(required = false) String description,
                                                 @RequestParam(required = false) String rules,
                                                 @RequestPart(required = false) MultipartFile[] images) {
        return DataResponse.of(listingWriteService.create(principal, listingType, name, roomCount, area, locationId,
                street, address, price, amenities, surroundings, description, rules, images));
    }

    @PutMapping("/{id}")
    public ActionResponse update(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id,
                                 @Valid @RequestBody UpdateListingRequest request) {
        return listingWriteService.update(principal, id, request);
    }

    @DeleteMapping("/{id}")
    public ActionResponse delete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        return listingWriteService.delete(principal, id);
    }

    @PatchMapping("/{id}/hide")
    public ActionResponse hide(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        return listingWriteService.changeVisibility(principal, id, false);
    }

    @PatchMapping("/{id}/unhide")
    public ActionResponse unhide(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        return listingWriteService.changeVisibility(principal, id, true);
    }
}
