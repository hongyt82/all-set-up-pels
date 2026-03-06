package com.khnp.pels.common.validation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.khnp.pels.api.dto.FieldErrorDto;
import com.khnp.pels.common.exception.RestBadRequestException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Json Parsing & Bind & Validation
 *
 * @author KwangYong
 * @since 2006-02-26
 */
@RequiredArgsConstructor
@Component
public class JsonMetaBinder {
    private static final Logger logger = LoggerFactory.getLogger(JsonMetaBinder.class);

    private final ObjectMapper objectMapper;

    private final Validator validator;

    public <T> T bindAndValidate (String json, JavaType javaType) {
        // Validation 체크 (1): Json이 null, "" 인 것 체크
        if(json == null || json.trim().isEmpty()) {
            throw new RestBadRequestException("JSON String is null/empty");
        }

        // Json Node로 변환
        final JsonNode rootNode;
        try {
            rootNode = objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new RestBadRequestException("Invalid JSON format");
        }

        // Validation 체크 (2): Json이 {}, [] 인 것 체크
        if((rootNode.isObject() && rootNode.isEmpty())
                || (rootNode.isArray() && rootNode.isEmpty())) {
            throw new RestBadRequestException("JSON is empty");
        }

        // Validation 체크 (3): Json이 Array(벌크), Object(단일) 여부 체크
        boolean isList = List.class.isAssignableFrom(javaType.getRawClass());  // javaType이 List 여부 판별
        if(isList){
            if(!rootNode.isArray()){
                throw new RestBadRequestException("JSON must be array");
            }
        } else {
            if(!rootNode.isObject()){
                throw new RestBadRequestException("JSON must be object");
            }
        }

        // DTO로 변환
        final Object objValue;
        try {
            objValue = objectMapper.treeToValue(rootNode, javaType);
        } catch (JsonProcessingException e) {
            throw new RestBadRequestException("Invalid JSON structure for DTO");
        }

        // Bean Validation 체크
        List<FieldErrorDto> errors = new ArrayList<>();
        if(isList) {  //벌크 스트로크
            @SuppressWarnings("unchecked")
            List<Object> list = (List<Object>) objValue;
            for(int i=0; i<list.size(); i++){
                Object obj = list.get(i);
                Set<ConstraintViolation<Object>> violations = validator.validate(obj);
                if(!violations.isEmpty()){
                    for(ConstraintViolation<Object> v : violations){
                        errors.add(new FieldErrorDto("[" + i + "]." + v.getPropertyPath().toString(), v.getMessage()));
                    }
                }
            }
        } else {  //단일 스트로크
            Set<ConstraintViolation<Object>> violations = validator.validate(objValue);
            if(!violations.isEmpty()){
                errors = violations.stream()
                        .map(v -> new FieldErrorDto(v.getPropertyPath().toString(), v.getMessage()))
                        .collect(Collectors.toList());
            }
        }

        // 속성값 검증 오류가 있을 때
        if(!errors.isEmpty()) {
            throw new RestBadRequestException("Field error", errors);
        }

        @SuppressWarnings("unchecked")
        T result = (T) objValue;
        return result;
    }
}
