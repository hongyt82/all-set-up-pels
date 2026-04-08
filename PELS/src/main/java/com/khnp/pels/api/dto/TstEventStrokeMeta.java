package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.math.BigDecimal;

/**
 * 이벤트 스트로크 메타 DTO
 * @author KwangYong
 * @since 2006-02-06
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TstEventStrokeMeta {

    @JsonProperty("X_CRDNT")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal xCrdnt;

    @JsonProperty("Y_CRDNT")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal yCrdnt;

    @JsonProperty("LINE_SNO")
    @NotNull
    @Min(Integer.MIN_VALUE) @Max(9999999999L)
    private Long lineSno;

    @JsonProperty("LINE_ETT")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal lineEtt;

}
