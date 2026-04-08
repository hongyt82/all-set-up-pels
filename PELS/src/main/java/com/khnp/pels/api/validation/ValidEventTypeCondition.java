package com.khnp.pels.api.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 이벤트 타입에 따른 조건 검증 Annotation
 * @author KwangYong
 * @since 2006-03-06
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EventTypeValidator.class)
public @interface ValidEventTypeCondition {

    String message() default "이벤트 타입에 따른 필수값이 누락되었습니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}