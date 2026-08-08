package com.phongtro247.housing.modules.notifications.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.Instant;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record NotificationResponse(
        Long id,
        String title,
        String message,
        boolean isRead,
        Instant createdAt
) {
}
