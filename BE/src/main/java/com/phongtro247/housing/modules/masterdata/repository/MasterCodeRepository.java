package com.phongtro247.housing.modules.masterdata.repository;

import com.phongtro247.housing.modules.masterdata.entity.MasterCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterCodeRepository extends JpaRepository<MasterCodeEntity, Long> {

    List<MasterCodeEntity> findByStatusTrueOrderByCategoryCodeAscNameAsc();

    List<MasterCodeEntity> findAllByOrderByCategoryCodeAscNameAsc();

    List<MasterCodeEntity> findByCategoryCodeIgnoreCaseAndStatusTrueOrderByNameAsc(String categoryCode);

    List<MasterCodeEntity> findByCategoryCodeIgnoreCaseOrderByNameAsc(String categoryCode);

    boolean existsByCategoryCodeIgnoreCaseAndCodeIgnoreCase(String categoryCode, String code);

    boolean existsByCategoryCodeIgnoreCaseAndCodeIgnoreCaseAndIdNot(String categoryCode, String code, Long id);
}
