package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.khnp.pels.api.validation.EventType;
import com.khnp.pels.api.validation.ValidEventTypeCondition;
import lombok.*;
import lombok.experimental.SuperBuilder;

import javax.validation.constraints.*;

/**
 *
 */
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ValidEventTypeCondition
@JsonPropertyOrder({
    "EVENT_SNO"
})
public class TstEventResponse extends TstEventMeta {

    @JsonProperty("EVENT_SNO")
    @NotNull
    private Long eventSno;

}
