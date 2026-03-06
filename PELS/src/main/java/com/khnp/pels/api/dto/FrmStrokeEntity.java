package com.khnp.pels.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class FrmStrokeEntity {
    private Long STROKE_ID;           //스트로크ID
    private Long FRM_UNQ_KY_VAL;      //절차서서식고유키값
    private Integer PAGE_NO;          //페이지번호
    private Integer POINT_CNT;        //포인트수
    private byte[] POINT_PATH;        //포인트경로
    private String STROKE_COLOR;      //스트로크색상
    private BigDecimal STROKE_WIDTH;  //스트로크폭
    private String STROKE_TOOL;       //스트로크도구
    private String CREPR_ID;          //생성자ID
    private String CRE_DT;            //생성일시
}
