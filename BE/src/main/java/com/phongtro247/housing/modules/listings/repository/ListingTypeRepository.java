package com.phongtro247.housing.modules.listings.repository;

import com.phongtro247.housing.modules.listings.entity.ListingTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ListingTypeRepository extends JpaRepository<ListingTypeEntity, Long> {

    Optional<ListingTypeEntity> findBySlugIgnoreCaseOrNameIgnoreCase(String slug, String name);
}
