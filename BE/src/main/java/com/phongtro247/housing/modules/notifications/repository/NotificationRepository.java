package com.phongtro247.housing.modules.notifications.repository;

import com.phongtro247.housing.modules.notifications.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query(value = "SELECT * FROM notifications WHERE user_id = :userId "
            + "ORDER BY created_at DESC LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<NotificationEntity> findRecentByUserId(@Param("userId") Long userId,
                                                 @Param("limit") int limit,
                                                 @Param("offset") int offset);

    long countByUser_IdAndReadFalse(Long userId);

    Optional<NotificationEntity> findByIdAndUser_Id(Long id, Long userId);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    int markAllAsRead(@Param("userId") Long userId);
}
