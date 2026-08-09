package com.phongtro247.housing.modules.notifications.service;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.notifications.dto.NotificationListResponse;
import com.phongtro247.housing.modules.notifications.dto.NotificationResponse;
import com.phongtro247.housing.modules.notifications.entity.NotificationEntity;
import com.phongtro247.housing.modules.notifications.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public NotificationListResponse list(AuthenticatedUser principal, Integer requestedLimit, Integer requestedOffset) {
        int limit = requestedLimit == null ? DEFAULT_LIMIT : Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
        int offset = requestedOffset == null ? 0 : Math.max(requestedOffset, 0);
        List<NotificationResponse> data = notificationRepository.findRecentByUserId(principal.id(), limit, offset)
                .stream().map(this::toResponse).toList();
        return new NotificationListResponse(true, data,
                notificationRepository.countByUser_IdAndReadFalse(principal.id()));
    }

    @Transactional
    public ActionResponse markAsRead(AuthenticatedUser principal, Long notificationId) {
        NotificationEntity notification = notificationRepository.findByIdAndUser_Id(notificationId, principal.id())
                .orElseThrow(() -> new NotFoundException("Notification", notificationId));
        notification.markAsRead();
        return ActionResponse.success(MessageCatalog.SUC_NOTIFICATION_READ);
    }

    @Transactional
    public ActionResponse markAllAsRead(AuthenticatedUser principal) {
        notificationRepository.markAllAsRead(principal.id());
        return ActionResponse.success(MessageCatalog.SUC_NOTIFICATIONS_READ);
    }

    @Transactional
    public ActionResponse delete(AuthenticatedUser principal, Long notificationId) {
        NotificationEntity notification = notificationRepository.findByIdAndUser_Id(notificationId, principal.id())
                .orElseThrow(() -> new NotFoundException("Notification", notificationId));
        notificationRepository.delete(notification);
        return ActionResponse.success(MessageCatalog.SUC_NOTIFICATION_DELETED);
    }

    private NotificationResponse toResponse(NotificationEntity notification) {
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getMessage(),
                notification.isRead(), notification.getCreatedAt());
    }
}
