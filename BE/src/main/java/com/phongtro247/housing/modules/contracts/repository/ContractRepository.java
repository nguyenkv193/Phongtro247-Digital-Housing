package com.phongtro247.housing.modules.contracts.repository;

import com.phongtro247.housing.modules.contracts.entity.ContractEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<ContractEntity, Long> {

    List<ContractEntity> findByOwner_IdOrderByCreatedAtDesc(Long ownerId);

    List<ContractEntity> findByOwner_Id(Long ownerId);

    List<ContractEntity> findAllByOrderByCreatedAtDesc();

    Optional<ContractEntity> findByIdAndOwner_Id(Long id, Long ownerId);

    Optional<ContractEntity> findFirstByTenant_IdOrderByCreatedAtDesc(Long tenantId);
}
