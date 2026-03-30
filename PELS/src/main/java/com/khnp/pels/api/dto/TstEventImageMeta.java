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
public class TstEventImageMeta {

    @JsonProperty("X_CRDNT")
    @NotNull
    @Min(1) @Max(999999)
    private Integer posX;

    @JsonProperty("Y_CRDNT")
    @NotNull
    @Min(1) @Max(999999)
    private Integer posY;

    @JsonProperty("WDTH_NUMV")
    @NotNull
    @Min(1) @Max(999999)
    private Integer width;

    @JsonProperty("HDTH_NUMV")
    @NotNull
    @Min(1) @Max(999999)
    private Integer height;

    @JsonProperty("URL_INFO")
    @NotBlank
    @Size(max = 500)
    private String fileUrl;

}
