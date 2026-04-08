package com.khnp.pels.common.exception;

/**
 * API 업무 Exception
 * @author KwangYong
 * @since 2006-02-06
 */
public class RestBizException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public RestBizException(String message) {
        super(message);
    }
}
