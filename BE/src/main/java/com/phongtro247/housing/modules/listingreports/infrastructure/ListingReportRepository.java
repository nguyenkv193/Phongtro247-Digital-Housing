package com.phongtro247.housing.modules.listingreports.infrastructure;

import com.phongtro247.housing.modules.listingreports.domain.ListingReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListingReportRepository extends JpaRepository<ListingReportEntity, Long> {

    boolean existsByReporter_IdAndListing_IdAndStatus(Long reporterId, Long listingId, String status);

    List<ListingReportEntity> findByReporter_IdOrderByCreatedAtDesc(Long reporterId);

    List<ListingReportEntity> findAllByOrderByCreatedAtDesc();
}
