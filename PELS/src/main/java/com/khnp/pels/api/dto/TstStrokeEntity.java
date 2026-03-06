package com.khnp.pels.api.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TstStrokeEntity {
    private Long TST_UNQ_KY_VAL;      //시험(점검)고유키값
    private Integer PAGE_NO;          //페이지번호
    private Integer STROKE_SEQ;       //스트로크일련번호
    private byte[] POINT_PATH;        //포인트경로
    private Long STROKE_COLOR;        //스트로크색상
    private BigDecimal STROKE_WIDTH;  //스트로크폭
    private String CREPR_ID;          //생성자ID
    private String CRE_DT;            //생성일시
    private String DLTPR_ID;          //삭제자ID
    private String DLT_DT;            //삭제일시
}
