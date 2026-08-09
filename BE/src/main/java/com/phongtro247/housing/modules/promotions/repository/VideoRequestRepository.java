package com.phongtro247.housing.modules.promotions.repository;

import com.phongtro247.housing.modules.promotions.entity.VideoRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRequestRepository extends JpaRepository<VideoRequestEntity, Long> {

    boolean existsByListing_IdAndStatus(Long listingId, String status);

    List<VideoRequestEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
