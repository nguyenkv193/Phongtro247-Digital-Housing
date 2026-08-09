package com.phongtro247.housing.modules.notifications.dto;

import java.util.List;

public record NotificationListResponse(
        boolean success,
        List<NotificationResponse> data,
        long unreadCount
) {
}
