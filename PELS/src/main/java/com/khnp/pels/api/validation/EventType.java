package com.khnp.pels.api.validation;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 이벤트 유형 정의
 *  - 페이지추가
 *  - 페이지삭제
 *  - 스트로크추가
 *  - 스트로크삭제
 *  - 사진추가
 *  - 사진삭제
 *  - 사진변경
 *  - 사진사이즈변경
 */
public enum EventType {
    PAGE_ADD(1),
    PAGE_DELETE(2),
    STROKE_ADD(3),
    STROKE_DELETE(4),
    IMAGE_ADD(5),
    IMAGE_DELETE(6),
    IMAGE_MODIFY(7),
    IMAGE_RESIZE(8);

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
     * 값으로 EventType 반환
     * @param value
     * @return
     */
    public static EventType fromValue(int value) {
        for (EventType t : values()) {
            if (t.getValue() == value) {
                return t;
            }
        }
        throw new IllegalArgumentException("Invalid EVENT_TYP value: " + value);
    }
}
