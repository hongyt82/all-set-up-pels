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
    private Long eventSno;          //이벤트일련번호
    private BigDecimal posX;        //좌표X
    private BigDecimal posY;        //좌표Y
    private byte[] pointPath;       //포인트경로
    private Long strokeColor;       //스트로크색상
    private BigDecimal strokeWidth; //스트로크폭
}
