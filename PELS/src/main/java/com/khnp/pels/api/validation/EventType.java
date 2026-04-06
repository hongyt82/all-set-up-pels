package com.khnp.pels.api.validation;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 이벤트 유형 정의
 *  - 1: 페이지추가
 *  - 2: 페이지삭제
 *  - 3: 스트로크추가
 *  - 4: 스트로크삭제
 *  - 5: 사진컨테이너추가
 *  - 6: 사진추가/변경
 *  - 7: 사진사이즈변경
 *  - 8: 사진삭제
 */
public enum EventType {
    PAGE_ADD(1),
    PAGE_DELETE(2),
    STROKE_ADD(3),
    STROKE_DELETE(4),
    IMAGE_CONTAINER_ADD(5),
    IMAGE_UPSERT(6),
    IMAGE_RESIZE(7),
    IMAGE_DELETE(8);

    private final int value;
    EventType(int value) {
        this.value = value;
    }

    /**
     * EventType에 대한 값 반환
     * @return
     */
    @JsonValue
    public int getValue() {
        return value;
    }

    /**
     * EventType을 Map으로 유지
     */
    private static final Map<Integer, EventType> MAP =
            Arrays.stream(values())
                    .collect(Collectors.toMap(EventType::getValue, e -> e));

    /**
     * 값으로 EventType 반환
     * @param value
     * @return
     */
    public static EventType fromValue(int value) {
        EventType e = MAP.get(value);
        if (e == null) {
            throw new IllegalArgumentException("Invalid EventType value: " + value);
        }
        return e;
    }

}
