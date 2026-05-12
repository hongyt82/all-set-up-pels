package com.khnp.pels.common.exception;

import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.FieldErrorDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * API Exception 핸들러
 * @author KwangYong
 * @since 2006-02-26
 */
@Order(1)
@RestControllerAdvice(basePackages = "com.khnp.pels.api")
public class RestExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(RestExceptionHandler.class);

    /**
     * 405 - 지원하지 않는 HTTP Method
     * - 여기에서 처리되지 않아서 GlobalErrorController에서 처리
     * @param e HttpRequestMethodNotSupportedException
     * @return ResponseEntity<ApiResponse<Void>>
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpRequestMethod(HttpRequestMethodNotSupportedException e) {
        logger.error("Unsupported HTTP Method: {}", e.getMethod());

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse
                        .fail("Unsupported HTTP Method: " + e.getMethod()));
    }

    /**
     * 404 - Not Found
     * @param e NoHandlerFoundException
     * @return ResponseEntity<ApiResponse<Void>>
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException e) {
        logger.error("Request API not found: {}", e.getRequestURL());

        return ResponseEntity.status(405).body(
                ApiResponse.fail("Request API not found: " + e.getRequestURL())
        );
    }

    /**
     * 400 - Request Param 누락
     * @param e BindException
     * @return ResponseEntity<ApiResponse<List<FieldErrorDto>>>
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
     * 400 - Bad Request
     * @param e RestBadRequestException
     * @return ResponseEntity<ApiResponse<Object>>
     */
    @ExceptionHandler(RestBadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(RestBadRequestException e) {
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
     * @return ResponseEntity<ApiResponse<Void>>
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

