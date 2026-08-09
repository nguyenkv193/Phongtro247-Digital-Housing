package com.phongtro247.housing.modules.masterdata.repository;

import com.phongtro247.housing.modules.masterdata.entity.MasterDataItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterDataItemRepository extends JpaRepository<MasterDataItemEntity, Long> {

    List<MasterDataItemEntity> findByGroup_CodeIgnoreCaseAndActiveTrueOrderBySortOrderAscNameAsc(String groupCode);

    List<MasterDataItemEntity> findByGroup_CodeIgnoreCaseOrderBySortOrderAscNameAsc(String groupCode);

    boolean existsByGroup_IdAndCodeIgnoreCase(Long groupId, String code);

    boolean existsByGroup_IdAndCodeIgnoreCaseAndIdNot(Long groupId, String code, Long id);
}
