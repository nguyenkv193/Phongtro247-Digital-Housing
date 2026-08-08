package com.phongtro247.housing.modules.reviews.infrastructure;

import com.phongtro247.housing.modules.reviews.domain.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    List<ReviewEntity> findByListing_IdOrderByCreatedAtDesc(Long listingId);

    List<ReviewEntity> findByListing_Owner_IdOrderByCreatedAtDesc(Long ownerId);

    List<ReviewEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<ReviewEntity> findByIdAndUser_Id(Long id, Long userId);

    boolean existsByListing_IdAndUser_Id(Long listingId, Long userId);
}
