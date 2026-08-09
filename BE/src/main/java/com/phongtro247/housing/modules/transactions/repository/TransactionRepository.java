package com.phongtro247.housing.modules.transactions.repository;

import com.phongtro247.housing.modules.transactions.entity.TransactionEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

    List<TransactionEntity> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<TransactionEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<TransactionEntity> findByExternalId(String externalId);
}
