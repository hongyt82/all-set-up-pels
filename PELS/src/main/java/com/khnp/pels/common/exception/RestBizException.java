package com.khnp.pels.common.exception;

public class RestBizException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public RestBizException(String message) {
        super(message);
    }
}
