package com.khnp.pels.api.converter;

import com.khnp.pels.api.dto.TstEventPageMeta;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import com.khnp.pels.api.dto.TstEventStrokeMeta;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PelsEventConverter {

    /**
     * 이벤트 페이지 목록 저장 - 내부 서버 전달 Entity List로 변환
     * @param list 이벤트 페이지 메타 목록
     * @return 이벤트 페이지 목록
     */
    public List<TstEventStrokeEntity> toPageEntityList(List<TstEventPageMeta> list) {
        return list.stream().map(dto -> TstEventStrokeEntity.builder()
                .EVENT_TYP(dto.getEVENT_TYP().getValue())
                .TST_UNQ_KY_VAL(dto.getTST_UNQ_KY_VAL())
                .PAGE_NO(dto.getPAGE_NO())
                .PDF_PAGE_NO(dto.getPDF_PAGE_NO())
                .USER_ID(dto.getUSER_ID())
                .EVENT_DT(dto.getEVENT_DT())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * 이벤트 페이지 저장 - 내부 서버 전달 Entity로 변환
     * @param dto 이벤트 페이지 메타 DTO
     * @return 이벤트 페이지 엔터티
     */
    public TstEventStrokeEntity toPageEntity(TstEventPageMeta dto) {
        return TstEventStrokeEntity.builder()
                .EVENT_TYP(dto.getEVENT_TYP().getValue())
                .TST_UNQ_KY_VAL(dto.getTST_UNQ_KY_VAL())
                .PAGE_NO(dto.getPAGE_NO())
                .PDF_PAGE_NO(dto.getPDF_PAGE_NO())
                .USER_ID(dto.getUSER_ID())
                .EVENT_DT(dto.getEVENT_DT())
                .build();
    }

    /**
     * 이벤트 스트로크 목록 저장 - 내부 서버 전달 Entity List로 변환
     * @param list 이벤트 페이지 메타 목록
     * @return 이벤트 페이지 목록
     */
    public List<TstEventStrokeEntity> toStrokeEntityList(List<TstEventStrokeMeta> list) {
        return list.stream().map(dto -> TstEventStrokeEntity.builder()
                .EVENT_TYP(dto.getEVENT_TYP().getValue())
                .TST_UNQ_KY_VAL(dto.getTST_UNQ_KY_VAL())
                .PAGE_NO(dto.getPAGE_NO())
                .STROKE_SEQ(dto.getSTROKE_SEQ())
                .STROKE_COLOR(dto.getSTROKE_COLOR())
                .STROKE_WIDTH(dto.getSTROKE_WIDTH())
                .USER_ID(dto.getUSER_ID())
                .EVENT_DT(dto.getEVENT_DT())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * 이벤트 스트로크 저장 - 내부 서버 전달 Entity로 변환
     * @param dto 이벤트 페이지 메타 DTO
     * @return 이벤트 페이지 엔터티
     */
    public TstEventStrokeEntity toStrokeEntity(TstEventStrokeMeta dto) {
        return TstEventStrokeEntity.builder()
                .EVENT_TYP(dto.getEVENT_TYP().getValue())
                .TST_UNQ_KY_VAL(dto.getTST_UNQ_KY_VAL())
                .PAGE_NO(dto.getPAGE_NO())
                .STROKE_SEQ(dto.getSTROKE_SEQ())
                .STROKE_COLOR(dto.getSTROKE_COLOR())
                .STROKE_WIDTH(dto.getSTROKE_WIDTH())
                .USER_ID(dto.getUSER_ID())
                .EVENT_DT(dto.getEVENT_DT())
                .build();
    }

}
