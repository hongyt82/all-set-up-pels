package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
public class TstEventImageMeta {

    @JsonProperty("X_CRDNT")
    @NotNull
    @DecimalMin(value = "-9999.99")
    @DecimalMax(value = "9999.99")
    private BigDecimal xCrdnt;

    @JsonProperty("Y_CRDNT")
    @NotNull
    @DecimalMin(value = "-9999.99")
    @DecimalMax(value = "9999.99")
    private BigDecimal yCrdnt;

    @JsonProperty("WDTH_NUMV")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal wdthNumv;

    @JsonProperty("HDTH_NUMV")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal hdthNumv;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("URL_INFO")
    @Size(max = 500)
    private String urlInfo;

}
