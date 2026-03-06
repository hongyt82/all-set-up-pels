package com.khnp.pels.common.exception;

public class RestBadRequestException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final Object data;

    public RestBadRequestException(String message) {
        super(message);
        this.data = null;
    }

    public RestBadRequestException(String message, Object data) {
        super(message);
        this.data = data;
    }

    public Object getData() {
        return data;
    }

}
