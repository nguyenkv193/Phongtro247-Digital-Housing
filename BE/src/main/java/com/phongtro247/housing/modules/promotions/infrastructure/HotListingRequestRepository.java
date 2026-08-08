package com.phongtro247.housing.modules.promotions.infrastructure;

import com.phongtro247.housing.modules.promotions.domain.HotListingRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HotListingRequestRepository extends JpaRepository<HotListingRequestEntity, Long> {

    boolean existsByListing_IdAndStatus(Long listingId, String status);

    List<HotListingRequestEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<HotListingRequestEntity> findByIdAndUser_IdAndStatus(Long id, Long userId, String status);
}
