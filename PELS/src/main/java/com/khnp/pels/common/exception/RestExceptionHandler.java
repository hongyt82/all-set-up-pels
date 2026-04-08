package com.khnp.pels.common.exception;

import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.FieldErrorDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * API Exception 핸들러
 * @author KwangYong
 * @since 2006-02-26
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = "com.khnp.pels.api")
class RestExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(RestExceptionHandler.class);

    /**
     * Request Param 오류 핸들러
     * @param e BindException
     * @return
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<List<FieldErrorDto>>> handleBind(BindException e) {
        List<FieldErrorDto> errors = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldErrorDto(
                        error.getField(),
                        error.getDefaultMessage()
                ))
                .collect(Collectors.toList());
        logger.error("Bad request param: {} | data={}", e.getMessage(), errors);

        return ResponseEntity.badRequest().body(
                ApiResponse.fail("Request Param error", errors)
        );
    }

    /**
     * Bad Request 오류 핸들러
     * @param e RestBadRequestException
     * @return
     */
    @ExceptionHandler(RestBadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBad(RestBadRequestException e) {
        if (e.getData() != null) {
            logger.error("Bad request: {} | data={}", e.getMessage(), e.getData());
        } else {
            logger.error("Bad request: {}", e.getMessage());
        }
        return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage(), e.getData()));
    }

    /**
     * 기타 오류 핸들러
     * @param e Exception
     * @return
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAny(Exception e) {
        String msg = Optional.ofNullable(e.getMessage()).orElse("");
        // msg 에서 응답 실패 body 전달전에 반드시 찍고 넘어가게 처리함
        // NPE 방지 차원에서 300 자 정도 자른 문자열로 넣는데 이건 상황에 따라...
        // 기타 예외 내용 찍음
        logger.error("Api Unhandled exception: {} — {}", e.getClass().getName(), msg, e);
        String truncated = msg.length() <= 300 ? msg : msg.substring(0, 300);
        return ResponseEntity
                .status(500)
                .body(ApiResponse.fail(truncated));
    }
}
