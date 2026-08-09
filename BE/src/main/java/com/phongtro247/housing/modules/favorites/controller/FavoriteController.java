package com.phongtro247.housing.modules.favorites.controller;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.favorites.dto.FavoriteListResponse;
import com.phongtro247.housing.modules.favorites.dto.FavoriteCountResponse;
import com.phongtro247.housing.modules.favorites.dto.FavoriteStatusResponse;
import com.phongtro247.housing.modules.favorites.service.FavoriteService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public FavoriteListResponse list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return favoriteService.list(principal);
    }

    @PostMapping("/{listingId}")
    public ActionResponse add(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long listingId) {
        return favoriteService.add(principal, listingId);
    }

    @DeleteMapping("/{listingId}")
    public ActionResponse remove(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long listingId) {
        return favoriteService.remove(principal, listingId);
    }

    @GetMapping("/check/{listingId}")
    public FavoriteStatusResponse check(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long listingId) {
        return new FavoriteStatusResponse(true, favoriteService.isFavorited(principal, listingId));
    }

    @GetMapping("/count")
    public FavoriteCountResponse count(@AuthenticationPrincipal AuthenticatedUser principal) {
        return new FavoriteCountResponse(true, favoriteService.count(principal));
    }
}
