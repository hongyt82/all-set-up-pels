package com.khnp.pels.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TstEventStrokeEntity {
    private Long EVENT_SEQ;          //이벤트순번
    private Integer EVENT_TYP;       //이벤트유형
    private Long TST_UNQ_KY_VAL;     //시험고유키값
    private Integer PAGE_NO;         //페이지번호
    private Integer PDF_PAGE_NO;     //PDF페이지번호
    private Integer STROKE_SEQ;      //스트로크일련번호
    private byte[] POINT_PATH;       //포인트경로
    private Long STROKE_COLOR;       //스트로크색상
    private BigDecimal STROKE_WIDTH; //스트로크폭
    private String USER_ID;          //사용자ID
    private String EVENT_DT;         //이벤트일시
}
