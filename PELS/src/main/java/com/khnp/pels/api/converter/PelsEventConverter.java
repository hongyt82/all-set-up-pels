package com.khnp.pels.api.converter;

import com.khnp.pels.api.dto.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PelsEventConverter {

    /**
     * 이벤트 목록 저장 - 내부 서버 전달 Entity List로 변환
     * @param list 이벤트 메타 목록
     * @return 이벤트 목록
     */
    public List<TstEventEntity> toEventList(List<TstEventMeta> list) {
        return list.stream().map(
                this::toEventEntity
        ).collect(Collectors.toList());
    }

    /**
     * 이벤트 저장 - 내부 서버 전달 Entity로 변환
     * @param dto 이벤트 메타 DTO
     * @return 이벤트 엔터티
     */
    public TstEventEntity toEventEntity(TstEventMeta dto) {
        String eventTrgtId;
        switch (dto.getEventTypSqno()){
            case STROKE_ADD:
            case STROKE_DELETE:
                eventTrgtId = dto.getStrkSeq().toString();
                break;
            case IMAGE_CONTAINER_ADD:
            case IMAGE_UPSERT:
            case IMAGE_RESIZE:
            case IMAGE_DELETE:
                eventTrgtId = dto.getImgId();
                break;
            default: eventTrgtId = null;
        }

        return TstEventEntity.builder()
                .eventTypSqno(dto.getEventTypSqno().getValue())
                .pwplId(dto.getPwplId())
                .chckSno(dto.getChckSno())
                .pageCnt(dto.getPageCnt())
                .insrtnPageCnt(dto.getInsrtnPageCnt())
                .pdfPageCnt(dto.getPdfPageCnt())
                .eventTrgtId(eventTrgtId)
                .userId(dto.getUserId())
                .eventCrteDt(dto.getEventCrteDt())
                .build();
    }

    /**
     * 이벤트 스트로크 목록 저장 - 내부 서버 전달 Entity List로 변환
     * @param list 이벤트 메타 목록
     * @return 이벤트 스트로크 목록
     */
    public List<TstEventStrokeEntity> toEventStrokeList(List<TstEventMeta> list) {
        return list.stream().map(
                this::toEventStrokeEntity
        ).collect(Collectors.toList());
    }

    /**
     * 이벤트 스트로크 저장 - 내부 서버 전달 Entity로 변환
     * @param dto 이벤트 메타 DTO
     * @return 이벤트 스트로크 엔터티
     */
    public TstEventStrokeEntity toEventStrokeEntity(TstEventMeta dto) {
        return TstEventStrokeEntity.builder()
                .xCrdnt(dto.getStroke().getXCrdnt())
                .yCrdnt(dto.getStroke().getYCrdnt())
                .lineSno(dto.getStroke().getLineSno())
                .lineEtt(dto.getStroke().getLineEtt())
                .build();
    }

    /**
     * 이벤트 사진 목록 저장 - 내부 서버 전달 Entity List로 변환
     * @param list 이벤트 메타 목록
     * @return 이벤트 사진 목록
     */
    public List<TstEventImageEntity> toEventImageList(List<TstEventMeta> list) {
        return list.stream().map(
                this::toEventImageEntity
        ).collect(Collectors.toList());
    }

    /**
     * 이벤트 사진 저장 - 내부 서버 전달 Entity List로 변환
     * @param dto 이벤트 메타
     * @return 이벤트 사진 엔터티
     */
    public TstEventImageEntity toEventImageEntity(TstEventMeta dto) {
        return TstEventImageEntity.builder()
            .xCrdnt(dto.getImage().getXCrdnt())
            .yCrdnt(dto.getImage().getYCrdnt())
            .wdthNumv(dto.getImage().getWdthNumv())
            .hdthNumv(dto.getImage().getHdthNumv())
            .urlInfo(dto.getImage().getUrlInfo())
            .build();
    }

}
