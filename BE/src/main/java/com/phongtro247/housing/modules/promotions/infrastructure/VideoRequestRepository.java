package com.phongtro247.housing.modules.promotions.infrastructure;

import com.phongtro247.housing.modules.promotions.domain.VideoRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoRequestRepository extends JpaRepository<VideoRequestEntity, Long> {

    boolean existsByListing_IdAndStatus(Long listingId, String status);

    List<VideoRequestEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
