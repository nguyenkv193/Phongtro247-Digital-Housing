package com.phongtro247.housing.modules.listings.application;

import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.modules.listings.api.dto.HomeListingsResponse;
import com.phongtro247.housing.modules.listings.api.dto.ListingCardResponse;
import com.phongtro247.housing.modules.listings.api.dto.ListingDetailResponse;
import com.phongtro247.housing.modules.listings.api.dto.ListingListResponse;
import com.phongtro247.housing.modules.listings.api.dto.LocationStatResponse;
import com.phongtro247.housing.modules.listings.api.dto.OwnerResponse;
import com.phongtro247.housing.modules.listings.domain.ListingEntity;
import com.phongtro247.housing.modules.listings.infrastructure.ListingRepository;
import com.phongtro247.housing.modules.listings.infrastructure.ListingSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ListingQueryService {

    private static final String PUBLISHED = "published";
    private final ListingRepository listingRepository;
    private final NumberFormat currency = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));

    public ListingQueryService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
        currency.setMaximumFractionDigits(0);
    }

    @Transactional(readOnly = true)
    public ListingListResponse search(String typeSlug, Boolean isHot, BigDecimal minPrice, BigDecimal maxPrice,
                                      BigDecimal minArea, BigDecimal maxArea, Long locationId,
                                      String sortBy, Boolean hasVideo, Integer limit) {
        Specification<ListingEntity> specification = ListingSpecifications.published();
        if (typeSlug != null && !typeSlug.isBlank()) specification = specification.and(ListingSpecifications.typeSlug(typeSlug));
        if (Boolean.TRUE.equals(isHot)) specification = specification.and(ListingSpecifications.hot());
        if (minPrice != null) specification = specification.and(ListingSpecifications.minPrice(minPrice));
        if (maxPrice != null) specification = specification.and(ListingSpecifications.maxPrice(maxPrice));
        if (minArea != null) specification = specification.and(ListingSpecifications.minArea(minArea));
        if (maxArea != null) specification = specification.and(ListingSpecifications.maxArea(maxArea));
        if (locationId != null) specification = specification.and(ListingSpecifications.location(locationId));
        if (Boolean.TRUE.equals(hasVideo)) specification = specification.and(ListingSpecifications.hasVideo());

        Sort sort = switch (sortBy == null ? "newest" : sortBy) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        int pageSize = Math.min(Math.max(limit == null ? 20 : limit, 1), 100);
        Page<ListingEntity> page = listingRepository.findAll(specification, PageRequest.of(0, pageSize, sort));
        List<ListingCardResponse> data = page.getContent().stream().map(this::toCard).toList();
        return new ListingListResponse(true, data, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public HomeListingsResponse home() {
        Map<String, List<ListingCardResponse>> data = new LinkedHashMap<>();
        for (String slug : List.of("nha-tro-phong-tro", "nha-nguyen-can", "can-ho")) {
            data.put(slug, search(slug, false, null, null, null, null, null, "newest", null, 10).data());
        }
        return new HomeListingsResponse(true, data);
    }

    @Transactional
    public ListingDetailResponse detail(Long id) {
        ListingEntity listing = listingRepository.findByIdAndStatus(id, PUBLISHED)
                .orElseThrow(() -> new NotFoundException("Listing", id));
        listing.incrementViews();
        return toDetail(listing);
    }

    @Transactional(readOnly = true)
    public DataResponse<List<LocationStatResponse>> locationStats() {
        return DataResponse.of(listingRepository.findPublishedLocationStats().stream()
                .map(item -> new LocationStatResponse(item.getLocation(), item.getCount()))
                .toList());
    }

    private ListingCardResponse toCard(ListingEntity listing) {
        String mainImage = listing.getImages().stream()
                .filter(image -> image.isMainImage())
                .map(image -> image.getImageUrl())
                .findFirst()
                .orElseGet(() -> listing.getImages().stream().findFirst()
                        .map(image -> image.getImageUrl()).orElse("/default-image.jpg"));
        return new ListingCardResponse(
                listing.getId(), listing.getName(), formatPrice(listing.getPrice()), listing.getPrice(),
                formatArea(listing.getArea()), listing.getArea(), locationName(listing), typeName(listing),
                typeSlug(listing), mainImage, listing.isHot(), listing.isHasVideo(), listing.getVideoUrl(),
                listing.getViews(), listing.getCreatedAt(), owner(listing));
    }

    private ListingDetailResponse toDetail(ListingEntity listing) {
        List<String> images = listing.getImages().stream().map(image -> image.getImageUrl()).toList();
        return new ListingDetailResponse(
                listing.getId(), listing.getName(), formatPrice(listing.getPrice()), listing.getPrice(),
                formatArea(listing.getArea()), listing.getArea(), listing.getAddress(), listing.getStreet(),
                locationName(listing), typeName(listing), typeSlug(listing), images,
                images.isEmpty() ? "/default-image.jpg" : images.getFirst(), listing.isHot(),
                listing.isHasVideo(), listing.getVideoUrl(), listing.getViews(), listing.getDescription(),
                listing.getRules(), listing.getAmenities(), listing.getSurroundings(), listing.getRoomCount(),
                listing.getCreatedAt(), owner(listing));
    }

    private OwnerResponse owner(ListingEntity listing) {
        return listing.getOwner() == null
                ? new OwnerResponse(null, null)
                : new OwnerResponse(listing.getOwner().getFullName(), listing.getOwner().getPhone());
    }

    private String locationName(ListingEntity listing) {
        return listing.getLocation() == null ? listing.getAddress() : listing.getLocation().getName();
    }

    private String typeName(ListingEntity listing) {
        return listing.getListingType() == null ? null : listing.getListingType().getName();
    }

    private String typeSlug(ListingEntity listing) {
        return listing.getListingType() == null ? null : listing.getListingType().getSlug();
    }

    private String formatPrice(BigDecimal price) {
        return price == null ? "0 đồng" : currency.format(price) + " đồng/tháng";
    }

    private String formatArea(BigDecimal area) {
        return area == null ? null : area.stripTrailingZeros().toPlainString() + " m²";
    }
}
