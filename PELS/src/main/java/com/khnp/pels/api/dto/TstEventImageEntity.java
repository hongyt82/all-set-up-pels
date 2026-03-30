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
    private Long    eventSno;  //이벤트일련번호
    private Long chckSno;     //시험번호
    private String pwplId;     //발전소아이디
    private Integer posX;      //좌표X
    private Integer posY;      //좌표Y
    private Integer width;     //가로크기
    private Integer height;    //세로크기
    private String fileUrl;    //파일URL
}
