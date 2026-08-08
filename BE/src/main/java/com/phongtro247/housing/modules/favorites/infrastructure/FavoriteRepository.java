package com.phongtro247.housing.modules.favorites.infrastructure;

import com.phongtro247.housing.modules.favorites.domain.FavoriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<FavoriteEntity, Long> {

    List<FavoriteEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<FavoriteEntity> findByUser_IdAndListing_Id(Long userId, Long listingId);

    boolean existsByUser_IdAndListing_Id(Long userId, Long listingId);

    long countByUser_Id(Long userId);
}
