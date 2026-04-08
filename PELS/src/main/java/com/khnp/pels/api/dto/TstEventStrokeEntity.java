package com.khnp.pels.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 이벤트 스트로크 객체 DTO
 * @author KwangYong
 * @since 2006-02-06
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TstEventStrokeEntity {
    private Long eventSno;       //이벤트일련번호
    private BigDecimal xCrdnt;   //좌표X
    private BigDecimal yCrdnt;   //좌표Y
    private byte[] linePthDcr;   //포인트경로
    private Long lineSno;        //스트로크색상
    private BigDecimal lineEtt;  //스트로크폭
}
