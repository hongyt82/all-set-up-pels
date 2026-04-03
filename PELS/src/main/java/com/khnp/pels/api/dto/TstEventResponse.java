package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.khnp.pels.api.validation.EventType;
import com.khnp.pels.api.validation.ValidEventTypeCondition;
import lombok.*;
import lombok.experimental.SuperBuilder;

import javax.validation.constraints.*;

/**
 * 이벤트 조회에 대한 응답 DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({
    "EVENT_SNO"
})
public class TstEventResponse extends TstEventMeta {

    @JsonProperty("EVENT_SNO")
    private Long eventSno;

    @JsonProperty("USER_NM")
    private Long userNm;

}
