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
public class TstEventImageMeta {

    @JsonProperty("X_CRDNT")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal posX;

    @JsonProperty("Y_CRDNT")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal posY;

    @JsonProperty("WDTH_NUMV")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal width;

    @JsonProperty("HDTH_NUMV")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @DecimalMax(value = "9999.99")
    private BigDecimal height;

    @JsonProperty("URL_INFO")
    @NotBlank
    @Size(max = 500)
    private String fileUrl;

}
