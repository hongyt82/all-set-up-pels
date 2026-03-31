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
    private Long    eventSno;   //이벤트일련번호
    private BigDecimal posX;    //좌표X
    private BigDecimal posY;    //좌표Y
    private BigDecimal width;   //가로크기
    private BigDecimal height;  //세로크기
    private String fileUrl;     //파일URL
}
