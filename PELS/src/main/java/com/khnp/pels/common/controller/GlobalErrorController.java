package com.khnp.pels.common.controller;

import com.khnp.pels.api.dto.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 전역 오류 핸들링 Controller
 * @author KwangYong
 * @since 2006-04-12
 */
@Controller
public class GlobalErrorController {

    private static final Logger logger = LoggerFactory.getLogger(GlobalErrorController.class);

    /**
     * Error Handling
     * @param request Http 요청
     * @param response Http 응답
     * @return view(Web page) or json(API) 반환
     */
    @RequestMapping("/error-handling")
    public Object handleError(
            HttpServletRequest request,
            HttpServletResponse  response
    ) {
        // HTTP Status Code
        Integer statusCode =
                (Integer) request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        // HTTP Error Request URI
        String originalUri =
                request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI).toString();

        // HTTP Context Path
        String contextPath =
                request.getContextPath();

        // HTTP Accept
        String accept =
                request.getHeader("Accept");

        // HTTP Method
        String method =
                request.getMethod();

        // 상태코드 세팅
        response.setStatus(
                statusCode != null ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR.value());

        // 오류 메시지
        String errorMessage =
                buildMessage(statusCode, method);

        String logMessage = "∙Request URI: " + originalUri +
                    System.lineSeparator() +
                    "∙HTTP Status Code: " + statusCode +
                    System.lineSeparator() +
                    "∙Error Message: " + errorMessage;
        logger.error(logMessage);

        // API 요청 여부 판단
        boolean isApiRequest = isApiRequest(originalUri, contextPath, accept);

        // ========================================
        // API
        // ========================================
        if (isApiRequest) {
            ApiResponse<Void> body =
                    ApiResponse.fail(errorMessage);

            return ResponseEntity
                    .status(statusCode)
                    .body(body);
        }

        // ========================================
        // Web Page
        // ========================================
        request.setAttribute("statusCode", statusCode);  // ERROR_STATUS_CODE
        request.setAttribute("errorMessage", errorMessage);  // ERROR_MESSAGE
        return "/pels/common/error";
    }

    /**
     * API 요청인지 식별
     * @param originalUri 요청 URI
     * @param accept 요청 Accept
     * @return API 요청 유무
     */
    private boolean isApiRequest(String originalUri, String contextPath, String accept) {

        // URI 확인
        if (originalUri != null
                && originalUri.startsWith(contextPath + "/api/")) {
            return true;
        }

        // Accept 확인
        return accept != null
                && accept.contains("application/json");
    }

    /**
     * 오류 메시지 생성
     * @param statusCode HTTP 상태코드
     * @param method HTTP Method
     * @return 오류 메시지
     */
    private String buildMessage(Integer statusCode, String method) {
        if(statusCode ==  null) {
            return "Unknown Error";
        }

        switch (statusCode) {
            case 400:  // HttpStatus.BAD_REQUEST
                return "Bad Request";

            case 401:  // HttpStatus.UNAUTHORIZED
                return "Unauthorized";

            case 404:  // HttpStatus.NOT_FOUND
                return "Resource Not Found";

            case 405:  // HttpStatus.METHOD_NOT_ALLOWED
                return "Unsupported HTTP Method";

            case 500:  // HttpStatus.INTERNAL_SERVER_ERROR
                return "Internal Server Error";

            default:
                return "HTTP Unknown Error";
        }
    }

    /**
     * 405 - 지원하지 않는 HTTP Method
     * - RestExeptionHandler에서 처리해야 되나 Servlet Container(Tomcat)에서 먼저 처리되므로 여기서 처리
     * - web.xml에 error-page 405 설정
     * @param request HttpServletRequest
     */
    @Deprecated
    @RequestMapping("/405")
    public ResponseEntity<ApiResponse<Void>> handleHttpRequestMethod (
            HttpServletRequest request
    ){
        logger.error("Unsupported HTTP Method: {}", request.getMethod());

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse
                        .fail("Unsupported HTTP Method: " + request.getMethod()));
    }

}

