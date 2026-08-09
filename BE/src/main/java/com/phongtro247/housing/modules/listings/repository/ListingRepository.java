package com.phongtro247.housing.modules.listings.repository;

import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;

public interface ListingRepository extends JpaRepository<ListingEntity, Long>, JpaSpecificationExecutor<ListingEntity> {

    Optional<ListingEntity> findByIdAndStatus(Long id, String status);

    List<ListingEntity> findByOwner_IdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

    List<ListingEntity> findByOwner_Id(Long ownerId);

    long countByListingType_Id(Long listingTypeId);

    @Query("select l.location.name as location, count(l.id) as count "
            + "from ListingEntity l where l.status = 'published' and l.location is not null "
            + "group by l.location.name order by count(l.id) desc")
    List<LocationStatProjection> findPublishedLocationStats();

    interface LocationStatProjection {
        String getLocation();
        Long getCount();
    }
}
