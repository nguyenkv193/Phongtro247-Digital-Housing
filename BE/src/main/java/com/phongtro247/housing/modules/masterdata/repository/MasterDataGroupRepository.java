package com.phongtro247.housing.modules.masterdata.repository;

import com.phongtro247.housing.modules.masterdata.entity.MasterDataGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MasterDataGroupRepository extends JpaRepository<MasterDataGroupEntity, Long> {

    List<MasterDataGroupEntity> findByActiveTrueOrderBySortOrderAscNameAsc();

    List<MasterDataGroupEntity> findAllByOrderBySortOrderAscNameAsc();

    Optional<MasterDataGroupEntity> findByCodeIgnoreCase(String code);
}
