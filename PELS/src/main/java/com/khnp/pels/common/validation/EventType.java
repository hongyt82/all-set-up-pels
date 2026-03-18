package com.khnp.pels.common.validation;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EventType {
    PAGE_ADD(1),
    PAGE_DELETE(2),
    STROKE_ADD(3),
    STROKE_DELETE(4);

    private final int value;
    EventType(int value) {
        this.value = value;
    }

    @JsonValue
    public int getValue() {
        return value;
    }

    @JsonCreator
    public static EventType forValue(int value) {
        for (EventType t : values()) {
            if (t.getValue() == value) {
                return t;
            }
        }
        throw new IllegalArgumentException("Invalid EVENT_TYP value: " + value);
    }
}
