package com.khnp.pels.common.exception;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;

@Order(Ordered.LOWEST_PRECEDENCE)
@ControllerAdvice
public class WebExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ModelAndView handle(Exception e, HttpServletRequest request) throws Exception {

        // API 요청이면 REST 쪽으로 넘김
        if (request.getRequestURI().startsWith(request.getContextPath() + "/api")) {
            throw e;
        }

        ModelAndView mv = new ModelAndView("error/500");
        mv.addObject("message", e.getMessage());
        return mv;
    }
}
