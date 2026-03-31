package com.khnp.pels.api.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class TstEventEntity {
    private Long eventSno;         //이벤트일련번호
    private Integer eventTyp;      //이벤트유형(1,2,3,4,5,6,7,8)
    private String pwplId;         //발전소아이디
    private Long chckSno;          //시험고유키값
    private Integer pageNo;        //페이지번호
    private Integer pageAddSeq;    //페이지추가순번
    private Integer pdfPageNo;     //PDF페이지번호
    private String eventTrgtSeq;   //이벤트대상ID(스트로크SEQ or 이미지ID)
    private String userId;         //사용자ID
    private String eventDt;        //이벤트일시
}
