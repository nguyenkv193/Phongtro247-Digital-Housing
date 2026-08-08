package com.phongtro247.housing.modules.users.infrastructure;

import com.phongtro247.housing.modules.users.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);

    @Query("select u from UserEntity u where lower(u.email) = lower(:identifier) or u.phone = :identifier")
    Optional<UserEntity> findByEmailOrPhone(@Param("identifier") String identifier);
}
