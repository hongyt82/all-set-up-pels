package com.khnp.pels.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 이벤트 조회에 대한 응답 DTO
 * @author KwangYong
 * @since 2006-02-06
 */
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({
    "EVENT_SNO",
    "EVENT_TYP_SQNO",
    "PWPL_ID",
    "CHCK_SNO",
    "PAGE_CNT",
    "INSRTN_PAGE_CNT",
    "PDF_PAGE_CNT",
    "STRK_SEQ",
    "IMG_ID",
    "USER_ID",
    "USER_NM",
    "EVENT_CRTE_DT"
})
public class TstEventResponse extends TstEventMeta {

    @JsonProperty("EVENT_SNO")
    private Long eventSno;

    @JsonProperty("USER_NM")
    private String userNm;

}
