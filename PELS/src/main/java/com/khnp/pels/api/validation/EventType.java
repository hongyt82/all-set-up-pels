package com.khnp.pels.api.validation;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EventType {
    PAGE_ADD(1),
    PAGE_DELETE(2),
    STROKE_ADD(3),
    STROKE_DELETE(4),
    IMAGE_ADD(5),
    IMAGE_DELETE(6);

    private final int value;
    EventType(int value) {
        this.value = value;
    }

    @JsonValue
    public int getValue() {
        return value;
    }

    public static EventType fromValue(int value) {
        for (EventType t : values()) {
            if (t.getValue() == value) {
                return t;
            }
        }
        throw new IllegalArgumentException("Invalid EVENT_TYP value: " + value);
    }
}
