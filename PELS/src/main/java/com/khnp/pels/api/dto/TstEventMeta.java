package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.khnp.pels.api.converter.EventTypeHandler;
import com.khnp.pels.api.validation.EventType;
import com.khnp.pels.api.validation.ValidEventTypeCondition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 *
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ValidEventTypeCondition
public class TstEventMeta {

    @JsonProperty("EVENT_TYP")
    @NotNull
    private EventType eventTyp;

    @JsonProperty("TST_UNQ_KY_VAL")
    @NotNull
    @Min(1)
    private Long tstUnqKyVal;

    @JsonProperty("PAGE_NO")
    @NotNull
    @Min(1) @Max(99999)
    private Integer pageNo;

    @JsonProperty("PAGE_ADD_SEQ")
    @NotNull
    @Min(0) @Max(99999)
    private Integer pageAddSeq;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("PDF_PAGE_NO")
    @Min(1) @Max(99999)
    private Integer pdfPageNo;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("STROKE_SEQ")
    @Min(1) @Max(99999)
    private Integer strokeSeq;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("IMAGE_SEQ")
    @Min(1) @Max(99999)
    private Integer imageSeq;

    @JsonProperty("USER_ID")
    @NotBlank
    @Size(max=20)
    private String userId;

    @JsonProperty("EVENT_DT")
    @NotNull
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$", message = "yyyy-MM-dd'T'HH:mm:ss.SSS와 일치해야 합니다")
    private String eventDt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("STROKE")
    @Valid
    private TstEventStrokeMeta stroke;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("IMAGE")
    @Valid
    private TstEventImageMeta image;

}
