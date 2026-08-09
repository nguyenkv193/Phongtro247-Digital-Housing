package com.phongtro247.housing.modules.notifications.controller;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.notifications.dto.NotificationListResponse;
import com.phongtro247.housing.modules.notifications.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public NotificationListResponse list(@AuthenticationPrincipal AuthenticatedUser principal,
                                         @RequestParam(required = false) Integer limit,
                                         @RequestParam(required = false) Integer offset) {
        return notificationService.list(principal, limit, offset);
    }

    @PutMapping("/{notificationId}/read")
    public ActionResponse markAsRead(@AuthenticationPrincipal AuthenticatedUser principal,
                                     @PathVariable Long notificationId) {
        return notificationService.markAsRead(principal, notificationId);
    }

    @PutMapping("/mark-all-read")
    public ActionResponse markAllAsRead(@AuthenticationPrincipal AuthenticatedUser principal) {
        return notificationService.markAllAsRead(principal);
    }

    @DeleteMapping("/{notificationId}")
    public ActionResponse delete(@AuthenticationPrincipal AuthenticatedUser principal,
                                 @PathVariable Long notificationId) {
        return notificationService.delete(principal, notificationId);
    }
}
