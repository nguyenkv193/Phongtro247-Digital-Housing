package com.phongtro247.housing.modules.locations.repository;

import com.phongtro247.housing.modules.locations.entity.LocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<LocationEntity, Long> {

    List<LocationEntity> findAllByOrderByNameAsc();

    List<LocationEntity> findByTypeOrderByNameAsc(String type);

    List<LocationEntity> findTop20ByNameContainingIgnoreCaseOrderByNameAsc(String name);
}
