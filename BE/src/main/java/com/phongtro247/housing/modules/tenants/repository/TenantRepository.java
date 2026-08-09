package com.phongtro247.housing.modules.tenants.repository;

import com.phongtro247.housing.modules.tenants.entity.TenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<TenantEntity, Long> {

    List<TenantEntity> findByOwner_IdOrderByCreatedAtDesc(Long ownerId);

    List<TenantEntity> findAllByOrderByNameAsc();

    Optional<TenantEntity> findByIdAndOwner_Id(Long id, Long ownerId);

    Optional<TenantEntity> findFirstByUser_IdOrderByCreatedAtDesc(Long userId);

    boolean existsByOwner_IdAndPhone(Long ownerId, String phone);
}
