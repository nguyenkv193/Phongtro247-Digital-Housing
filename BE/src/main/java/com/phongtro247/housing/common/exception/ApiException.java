package com.phongtro247.housing.common.exception;

import com.phongtro247.housing.common.message.AppMessage;
import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final AppMessage appMessage;

    public ApiException(HttpStatus status, AppMessage appMessage) {
        super(appMessage.message());
        this.status = status;
        this.appMessage = appMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return appMessage.code();
    }

    public AppMessage getAppMessage() {
        return appMessage;
    }
}
