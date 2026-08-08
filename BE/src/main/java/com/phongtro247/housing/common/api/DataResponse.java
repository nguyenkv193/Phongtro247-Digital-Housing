package com.phongtro247.housing.common.api;

public record DataResponse<T>(boolean success, T data) {

    public static <T> DataResponse<T> of(T data) {
        return new DataResponse<>(true, data);
    }
}
