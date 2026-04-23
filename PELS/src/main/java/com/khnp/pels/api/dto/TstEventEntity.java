package com.khnp.pels.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 이벤트 객체 DTO
 * @author KwangYong
 * @since 2006-02-06
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class TstEventEntity {
    private Long eventSno;                //이벤트일련번호
    private Integer eventTypSqno;         //이벤트유형(1,2,3,4,5,6,7,8)
    private String pwplId;                //발전소아이디
    private Long chckSno;                 //시험고유키값
    private Integer pageCnt;              //페이지번호
    private Integer insrtnPageCnt;        //페이지추가순번
    private Integer pdfPageCnt;           //PDF페이지번호
    private String eventTrgtId;           //이벤트대상ID(스트로크SEQ or 이미지ID)
    private String userId;                //사용자ID
    private String userFnm;               //사용자명
    private String chkprInfo;             //점검자정보
    private String eventCrteDt;           //이벤트일시
    private TstEventStrokeEntity stroke;  //스트로크
    private TstEventImageEntity image;    //사진
}
