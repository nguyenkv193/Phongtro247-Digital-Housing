package com.phongtro247.housing.modules.favorites.service;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.favorites.dto.FavoriteListResponse;
import com.phongtro247.housing.modules.favorites.dto.FavoriteResponse;
import com.phongtro247.housing.modules.favorites.entity.FavoriteEntity;
import com.phongtro247.housing.modules.favorites.repository.FavoriteRepository;
import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import com.phongtro247.housing.modules.listings.repository.ListingRepository;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.modules.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, UserRepository userRepository,
                           ListingRepository listingRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }

    @Transactional(readOnly = true)
    public FavoriteListResponse list(AuthenticatedUser principal) {
        List<FavoriteResponse> data = favoriteRepository.findByUser_IdOrderByCreatedAtDesc(principal.id())
                .stream().map(this::toResponse).toList();
        return new FavoriteListResponse(true, data, data.size());
    }

    @Transactional
    public ActionResponse add(AuthenticatedUser principal, Long listingId) {
        ListingEntity listing = listingRepository.findByIdAndStatus(listingId, "published")
                .orElseThrow(() -> new NotFoundException("Listing", listingId));
        if (favoriteRepository.existsByUser_IdAndListing_Id(principal.id(), listingId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_ALREADY_FAVORITED);
        }
        UserEntity user = userRepository.getReferenceById(principal.id());
        favoriteRepository.save(new FavoriteEntity(user, listing));
        return ActionResponse.success(MessageCatalog.SUC_FAVORITE_ADDED);
    }

    @Transactional
    public ActionResponse remove(AuthenticatedUser principal, Long listingId) {
        FavoriteEntity favorite = favoriteRepository.findByUser_IdAndListing_Id(principal.id(), listingId)
                .orElseThrow(() -> new NotFoundException("Favorite", listingId));
        favoriteRepository.delete(favorite);
        return ActionResponse.success(MessageCatalog.SUC_FAVORITE_REMOVED);
    }

    @Transactional(readOnly = true)
    public boolean isFavorited(AuthenticatedUser principal, Long listingId) {
        return favoriteRepository.existsByUser_IdAndListing_Id(principal.id(), listingId);
    }

    @Transactional(readOnly = true)
    public long count(AuthenticatedUser principal) {
        return favoriteRepository.countByUser_Id(principal.id());
    }

    private FavoriteResponse toResponse(FavoriteEntity favorite) {
        ListingEntity listing = favorite.getListing();
        String image = listing.getImages().stream().filter(item -> item.isMainImage())
                .map(item -> item.getImageUrl()).findFirst()
                .orElseGet(() -> listing.getImages().stream().findFirst()
                        .map(item -> item.getImageUrl()).orElse("/default-image.jpg"));
        return new FavoriteResponse(
                favorite.getId(), favorite.getCreatedAt(), listing.getId(), listing.getName(), listing.getPrice(),
                listing.getArea(), listing.getAddress(), listing.getStreet(), listing.getStatus(), listing.isHot(),
                listing.getCreatedAt(), listing.getListingType() == null ? null : listing.getListingType().getName(),
                listing.getListingType() == null ? null : listing.getListingType().getSlug(),
                listing.getLocation() == null ? listing.getAddress() : listing.getLocation().getName(), image,
                listing.getOwner() == null ? null : listing.getOwner().getFullName(),
                listing.getOwner() == null ? null : listing.getOwner().getPhone());
    }
}
