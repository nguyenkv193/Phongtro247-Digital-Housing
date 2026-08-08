package com.phongtro247.housing.common.api;

import com.phongtro247.housing.common.message.AppMessage;

public record ActionResponse(boolean success, String code, String message) {

    public static ActionResponse success(AppMessage appMessage) {
        return new ActionResponse(true, appMessage.code(), appMessage.message());
    }

    public static ActionResponse warning(AppMessage appMessage) {
        return new ActionResponse(true, appMessage.code(), appMessage.message());
    }

    public static ActionResponse failure(AppMessage appMessage) {
        return new ActionResponse(false, appMessage.code(), appMessage.message());
    }
}
