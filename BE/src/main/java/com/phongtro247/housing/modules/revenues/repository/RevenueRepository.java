package com.phongtro247.housing.modules.revenues.repository;

import com.phongtro247.housing.modules.revenues.entity.RevenueEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RevenueRepository extends JpaRepository<RevenueEntity, Long> {

    List<RevenueEntity> findAllByOrderByCreatedAtDesc();
}
