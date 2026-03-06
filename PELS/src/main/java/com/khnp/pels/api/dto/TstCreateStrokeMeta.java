package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TstCreateStrokeMeta {

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

    @JsonProperty("STROKE_COLOR")
    @NotNull
    private Long STROKE_COLOR;

    @JsonProperty("STROKE_WIDTH")
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @DecimalMax(value = "1000.0")
    private BigDecimal STROKE_WIDTH;

    @JsonProperty("CREPR_ID")
    @NotBlank
    @Size(max=20)
    private String CREPR_ID;

    @JsonProperty("CRE_DT")
    @NotNull
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$", message = "yyyy-MM-dd'T'HH:mm:ss.SSS와 일치해야 합니다")
    private String CRE_DT;

    // 생성 후 삭제한 경우
    @JsonProperty("DLTPR_ID")
    @Size(max=20)
    private String DLTPR_ID;

    @JsonProperty("DLT_DT")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$", message = "yyyy-MM-dd'T'HH:mm:ss.SSS와 일치해야 합니다")
    private String DLT_DT;

}
