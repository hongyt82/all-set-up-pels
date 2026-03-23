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

    @JsonProperty("POS_X")
    @NotNull
    @Min(1) @Max(999999)
    private Integer posX;

    @JsonProperty("POS_Y")
    @NotNull
    @Min(1) @Max(999999)
    private Integer posY;

    @JsonProperty("WIDTH")
    @NotNull
    @Min(1) @Max(999999)
    private Integer width;

    @JsonProperty("HEIGHT")
    @NotNull
    @Min(1) @Max(999999)
    private Integer height;

    @JsonProperty("FILE_URL")
    @NotBlank
    @Size(max = 500)
    private String fileUrl;

}
