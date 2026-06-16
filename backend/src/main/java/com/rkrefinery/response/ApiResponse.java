package com.rkrefinery.response;

import lombok.*;

import java.time.Instant;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
public class ApiResponse<T> {
    @Builder.Default
    private Instant timestamp = Instant.now();
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> fail(String message) {
        return ApiResponse.<T>builder().success(false).message(message).build();
    }
}