package com.khnp.pels.common.exception;

import com.khnp.pels.api.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Optional;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = "com.khnp.pels.api")
class RestExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

    @ExceptionHandler(RestBadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBad(RestBadRequestException e) {
        if (e.getData() != null) {
            log.warn("Bad request: {} | data={}", e.getMessage(), e.getData());
        } else {
            log.warn("Bad request: {}", e.getMessage());
        }
        return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage(), e.getData()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAny(Exception e) {
        String msg = Optional.ofNullable(e.getMessage()).orElse("");
        // msg 에서 응답 실패 body 전달전에 반드시 찍고 넘어가게 처리함
        // NPE 방지 차원에서 300 자 정도 자른 문자열로 넣는데 이건 상황에 따라...
        // 기타 예외 내용 찍음
        log.warn("Unhandled exception: {} — {}", e.getClass().getSimpleName(), msg, e);
        String truncated = msg.length() <= 300 ? msg : msg.substring(0, 300);
        return ResponseEntity
                .status(500)
                .body(ApiResponse.fail(truncated));
    }
}
