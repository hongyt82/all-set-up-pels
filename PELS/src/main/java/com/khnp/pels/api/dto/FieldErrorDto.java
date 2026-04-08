package com.khnp.pels.api.dto;

import lombok.Value;

/**
 * 속성 오류 담는 DTO
 * @author KwangYong
 * @since 2006-02-06
 */
@Value
public class FieldErrorDto {
    private String field;
    private String message;
}
