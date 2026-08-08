package com.phongtro247.housing.modules.listings.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.common.storage.LocalFileStorageService;
import com.phongtro247.housing.modules.listings.api.dto.MyListingResponse;
import com.phongtro247.housing.modules.listings.api.dto.UpdateListingRequest;
import com.phongtro247.housing.modules.listings.domain.ListingEntity;
import com.phongtro247.housing.modules.listings.infrastructure.ListingRepository;
import com.phongtro247.housing.modules.listings.infrastructure.ListingTypeRepository;
import com.phongtro247.housing.modules.locations.domain.LocationEntity;
import com.phongtro247.housing.modules.locations.infrastructure.LocationRepository;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import com.phongtro247.housing.modules.users.infrastructure.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
public class ListingWriteService {

    private static final int MAX_IMAGES = 10;
    private static final int MAX_LIMIT = 100;

    private final ListingRepository listingRepository;
    private final ListingTypeRepository listingTypeRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final LocalFileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    public ListingWriteService(ListingRepository listingRepository, ListingTypeRepository listingTypeRepository,
                               LocationRepository locationRepository, UserRepository userRepository,
                               LocalFileStorageService fileStorageService, ObjectMapper objectMapper) {
        this.listingRepository = listingRepository;
        this.listingTypeRepository = listingTypeRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public DataResponse<List<MyListingResponse>> myListings(AuthenticatedUser principal, String status,
                                                             Integer requestedLimit, Integer requestedOffset) {
        int limit = Math.min(Math.max(requestedLimit == null ? 20 : requestedLimit, 1), MAX_LIMIT);
        int offset = Math.max(requestedOffset == null ? 0 : requestedOffset, 0);
        int fetchSize = Math.min(limit + offset, MAX_LIMIT + MAX_LIMIT);
        List<ListingEntity> listings = listingRepository.findByOwner_IdOrderByCreatedAtDesc(principal.id(),
                PageRequest.of(0, Math.max(fetchSize, limit), Sort.by(Sort.Direction.DESC, "createdAt")));
        List<MyListingResponse> data = listings.stream()
                .filter(listing -> status == null || status.isBlank() || status.equalsIgnoreCase(listing.getStatus()))
                .skip(offset)
                .limit(limit)
                .map(this::toResponse)
                .toList();
        return DataResponse.of(data);
    }

    @Transactional
    public MyListingResponse create(AuthenticatedUser principal, String listingType, String name,
                                    Integer roomCount, BigDecimal area, Long locationId, String street,
                                    String address, BigDecimal price, String amenities, String surroundings,
                                    String description, String rules, MultipartFile[] images) {
        validateRequired(name, price, area);
        UserEntity owner = userRepository.getReferenceById(principal.id());
        var type = listingTypeRepository.findBySlugIgnoreCaseOrNameIgnoreCase(listingType, listingType)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_INVALID_LISTING_TYPE));
        LocationEntity location = locationId == null ? null : locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("Location", locationId));
        if (images != null && images.length > MAX_IMAGES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_TOO_MANY_IMAGES.format(MAX_IMAGES));
        }
        ListingEntity listing = new ListingEntity(owner, type, location, name, price, area, address, street,
                description, rules, roomCount == null ? 1 : roomCount, normalizeJson(amenities),
                normalizeJson(surroundings));
        if (images != null) {
            for (int index = 0; index < images.length; index++) {
                listing.addImage(fileStorageService.store(images[index]), index == 0);
            }
        }
        return toResponse(listingRepository.save(listing));
    }

    @Transactional
    public ActionResponse update(AuthenticatedUser principal, Long id, UpdateListingRequest request) {
        ListingEntity listing = ownedListing(principal, id);
        listing.updateDetails(
                valueOr(request.name(), listing.getName()),
                valueOr(request.price(), listing.getPrice()),
                valueOr(request.area(), listing.getArea()),
                valueOr(request.address(), listing.getAddress()),
                valueOr(request.street(), listing.getStreet()),
                valueOr(request.description(), listing.getDescription()),
                valueOr(request.rules(), listing.getRules()),
                valueOr(request.roomCount(), listing.getRoomCount()),
                request.amenities() == null ? null : toJson(request.amenities()),
                request.surroundings() == null ? null : toJson(request.surroundings()));
        if (request.isHot() != null) listing.setHot(request.isHot());
        if (request.status() != null && !request.status().isBlank()) listing.changeStatus(request.status());
        return ActionResponse.success(MessageCatalog.SUC_LISTING_UPDATED);
    }

    @Transactional
    public ActionResponse delete(AuthenticatedUser principal, Long id) {
        ListingEntity listing = ownedListing(principal, id);
        listingRepository.delete(listing);
        return ActionResponse.success(MessageCatalog.SUC_LISTING_DELETED);
    }

    @Transactional
    public ActionResponse changeVisibility(AuthenticatedUser principal, Long id, boolean visible) {
        ListingEntity listing = ownedListing(principal, id);
        if (visible) {
            if (!"hidden".equalsIgnoreCase(listing.getStatus())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_LISTING_NOT_HIDDEN);
            }
            listing.changeStatus("published");
            return ActionResponse.success(MessageCatalog.SUC_LISTING_VISIBLE);
        }
        if (!"published".equalsIgnoreCase(listing.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_LISTING_NOT_PUBLISHED);
        }
        listing.changeStatus("hidden");
        return ActionResponse.success(MessageCatalog.SUC_LISTING_HIDDEN);
    }

    private ListingEntity ownedListing(AuthenticatedUser principal, Long id) {
        ListingEntity listing = listingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Listing", id));
        if (listing.getOwner() == null || !listing.getOwner().getId().equals(principal.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, MessageCatalog.ERR_LISTING_ACCESS_DENIED);
        }
        return listing;
    }

    private void validateRequired(String name, BigDecimal price, BigDecimal area) {
        if (name == null || name.isBlank() || price == null || price.signum() <= 0 || area == null || area.signum() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_INVALID_LISTING_DATA);
        }
    }

    private String normalizeJson(String raw) {
        if (raw == null || raw.isBlank()) return "[]";
        try {
            return objectMapper.writeValueAsString(objectMapper.readTree(raw));
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_INVALID_JSON_FIELD);
        }
    }

    private String toJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_LISTING_ATTRIBUTES_SERIALIZATION);
        }
    }

    private MyListingResponse toResponse(ListingEntity listing) {
        String image = listing.getImages().stream().filter(item -> item.isMainImage())
                .map(item -> item.getImageUrl()).findFirst()
                .orElseGet(() -> listing.getImages().stream().findFirst().map(item -> item.getImageUrl()).orElse("/default-image.jpg"));
        return new MyListingResponse(listing.getId(), listing.getName(), listing.getPrice(), listing.getArea(),
                listing.getAddress(), listing.getStatus(), listing.isHot(), listing.isHasVideo(), listing.getVideoUrl(),
                listing.getViews(), listing.getCreatedAt(), listing.getListingType() == null ? null : listing.getListingType().getName(), image);
    }

    private <T> T valueOr(T requested, T current) {
        return requested == null ? current : requested;
    }
}
