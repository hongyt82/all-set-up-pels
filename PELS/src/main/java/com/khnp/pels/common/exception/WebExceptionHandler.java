package com.khnp.pels.common.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

/**
 * 일반 Web Exception 핸들러
 * @author KwangYong
 * @since 2006-02-26
 */
@Order(2)
@ControllerAdvice(basePackages = {
        "com.khnp.pels.common",
        "com.khnp.pels.exam",
        "com.khnp.pels.system",
        "common"
})
public class WebExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ModelAndView handle(Exception e, HttpServletRequest request) throws Exception {

        // API 요청이면 REST 쪽으로 넘김
        if (request.getRequestURI().startsWith(request.getContextPath() + "/api")) {
            throw e;
        }
        logger.error("Web Unhandled exception: {}", e.getMessage());

        ModelAndView mv = new ModelAndView("/pels/common/error");
        mv.addObject("statusCode",  request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE));
        mv.addObject("errorMessage", e.getMessage());
        return mv;
    }
}
