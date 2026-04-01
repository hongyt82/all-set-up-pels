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
public class TstEventImageEntity {
    private Long    eventSno;     //이벤트일련번호
    private BigDecimal xCrdnt;    //좌표X
    private BigDecimal yCrdnt;    //좌표Y
    private BigDecimal wdthNumv;  //가로크기
    private BigDecimal hdthNumv;  //세로크기
    private String urlInfo;       //파일URL
}
