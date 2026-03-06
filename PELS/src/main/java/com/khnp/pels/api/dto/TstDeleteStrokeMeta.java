package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TstDeleteStrokeMeta {

    @JsonProperty("TST_UNQ_KY_VAL")
    @NotNull
    @Min(1)
    private Long TST_UNQ_KY_VAL;

    @JsonProperty("PAGE_NO")
    @NotNull
    @Min(1) @Max(99999)
    private Integer PAGE_NO;

    @JsonProperty("STROKE_SEQ")
    @NotNull
    @Min(1) @Max(99999)
    private Integer STROKE_SEQ;

    @JsonProperty("DLTPR_ID")
    @Size(max=20)
    private String DLTPR_ID;

    @JsonProperty("DLT_DT")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$", message = "yyyy-MM-dd'T'HH:mm:ss.SSS와 일치해야 합니다")
    private String DLT_DT;

}
