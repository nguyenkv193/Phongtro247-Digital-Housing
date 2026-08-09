package com.phongtro247.housing.modules.incidents.repository;

import com.phongtro247.housing.modules.incidents.entity.IncidentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncidentRepository extends JpaRepository<IncidentEntity, Long> {

    List<IncidentEntity> findByListing_Owner_IdOrderByCreatedAtDesc(Long ownerId);

    Optional<IncidentEntity> findByIdAndListing_Owner_Id(Long id, Long ownerId);
}
