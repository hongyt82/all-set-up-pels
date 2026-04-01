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

    @JsonProperty("EVENT_TYP_SQNO")
    @NotNull
    private EventType eventTypSqno;

    @JsonProperty("PWPL_ID")
    @NotBlank
    @Size(max=20)
    private String pwplId;

    @JsonProperty("CHCK_SNO")
    @NotNull
    @Min(1)
    private Long chckSno;

    @JsonProperty("PAGE_CNT")
    @NotNull
    @Min(1) @Max(99999)
    private Integer pageCnt;

    @JsonProperty("INSRTN_PAGE_CNT")
    @NotNull
    @Min(0) @Max(99999)
    private Integer insrtnPageCnt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("PDF_PAGE_CNT")
    @Min(0) @Max(99999)
    private Integer pdfPageCnt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("STRK_SEQ")
    @Min(1) @Max(99999)
    private Integer strkSeq;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("IMG_ID")
    @Size(max=50)
    private String imgId;

    @JsonProperty("USER_ID")
    @NotBlank
    @Size(max=20)
    private String userId;

    @JsonProperty("EVENT_CRTE_DT")
    @NotNull
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$", message = "yyyy-MM-dd'T'HH:mm:ss.SSS와 일치해야 합니다")
    private String eventCrteDt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("STROKE")
    @Valid
    private TstEventStrokeMeta stroke;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("IMAGE")
    @Valid
    private TstEventImageMeta image;

}
