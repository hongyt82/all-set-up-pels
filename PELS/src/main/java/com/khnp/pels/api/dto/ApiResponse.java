package com.khnp.pels.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * API 응답 DTO
 * @author KwangYong
 * @since 2006-02-06
 */
@Getter
@AllArgsConstructor
public class  ApiResponse<T> {

    private String resultCd;
    private String resultMsg;
    private T data;

    public static ApiResponse<Void> success() {
        return new ApiResponse<Void>("true", "Processing was successful", null);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("true", "Processing was successful", data);
    }

    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<Void>("true", message, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("true", message, data);
    }

    public static ApiResponse<Void> fail(String message) {
        return new ApiResponse<Void>("false", message, null);
    }

    public static <T> ApiResponse<T> fail(String message, T data) {
        return new ApiResponse<>("false", message, data);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<Void>("false", message, null);
    }

}
