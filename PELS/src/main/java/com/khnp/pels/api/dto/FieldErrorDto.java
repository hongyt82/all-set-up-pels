package com.khnp.pels.api.dto;

import lombok.Value;

@Value
public class FieldErrorDto {
    private String field;
    private String message;
}
