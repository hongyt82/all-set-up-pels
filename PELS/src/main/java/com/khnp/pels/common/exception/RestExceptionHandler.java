package com.khnp.pels.common.exception;

import com.khnp.pels.api.dto.ApiResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Optional;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = "com.khnp.pels.api")
class RestExceptionHandler {

    @ExceptionHandler(RestBadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBad(RestBadRequestException e) {
        return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage(), e.getData()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAny(Exception e) {
        String msg = Optional.ofNullable(e.getMessage()).orElse("");
        return ResponseEntity
                .status(500)
                .body(ApiResponse.fail(e.getMessage().substring(0, Math.min(msg.length(), 300))));
    }
}
