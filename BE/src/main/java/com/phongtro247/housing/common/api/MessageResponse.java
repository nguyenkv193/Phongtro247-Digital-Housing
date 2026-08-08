package com.phongtro247.housing.common.api;

import com.phongtro247.housing.common.message.AppMessage;

public record MessageResponse(String code, String message) {

    public static MessageResponse success(AppMessage appMessage) {
        return new MessageResponse(appMessage.code(), appMessage.message());
    }
}
