package com.khnp.pels.common.validation;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Json Java Factory
 *
 * @author KwangYong
 * @since 2006-02-26
 */
@RequiredArgsConstructor
@Component
public class JsonTypeFactory {

    private final ObjectMapper objectMapper;

    /**
     * 일반객체 Type 생성 반환
     * @param clazz
     * @return
     * @param <T>
     */
    public <T> JavaType objectType(Class<T> clazz) {
        return objectMapper.getTypeFactory().constructType(clazz);
    }

    /**
     * List 객체 Type 생성 반환
     * @param clazz
     * @return
     * @param <T>
     */
    public <T> JavaType listType(Class<T> clazz) {
        return objectMapper.getTypeFactory()
                .constructCollectionType(List.class, clazz);
    }

}
