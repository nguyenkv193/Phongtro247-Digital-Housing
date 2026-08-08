package com.phongtro247.housing.common.message;

public record AppMessage(String code, String message) {

    public AppMessage format(Object... arguments) {
        return new AppMessage(code, message.formatted(arguments));
    }
}
