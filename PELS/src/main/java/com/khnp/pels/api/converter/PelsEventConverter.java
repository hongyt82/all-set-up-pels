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
        String eventTrgtSeq;
        switch (dto.getEventTyp()){
            case STROKE_ADD:
            case STROKE_DELETE:
                eventTrgtSeq = dto.getStrkSeq().toString();
                break;
            case IMAGE_ADD:
            case IMAGE_DELETE:
            case IMAGE_MODIFY:
            case IMAGE_RESIZE:
                eventTrgtSeq = dto.getImgId();
                break;
            default: eventTrgtSeq = null;
        }

        return TstEventEntity.builder()
                .eventTyp(dto.getEventTyp().getValue())
                .pwplId(dto.getPwplId())
                .chckSno(dto.getChckSno())
                .pageNo(dto.getPageNo())
                .pageAddSeq(dto.getPageAddSeq())
                .pdfPageNo(dto.getPdfPageNo())
                .eventTrgtSeq(eventTrgtSeq)
                .userId(dto.getUserId())
                .eventDt(dto.getEventDt())
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
                .posX(dto.getStroke().getPosX())
                .posY(dto.getStroke().getPosY())
                .strokeColor(dto.getStroke().getStrokeColor())
                .strokeWidth(dto.getStroke().getStrokeWidth())
                .build();
    }

    /**
     * 이벤트 사진 목록 저장 - 내부 서버 전달 Entity List로 변환
     * @param list 이벤트 메타 목록
     * @return 이벤트 사진 목록
     */
    public List<TstEventImageEntity> toEventImageList(List<TstEventMeta> list) {
        return list.stream().map(
                this::toEventImageEntiry
        ).collect(Collectors.toList());
    }

    /**
     * 이벤트 사진 저장 - 내부 서버 전달 Entity List로 변환
     * @param dto 이벤트 메타
     * @return 이벤트 사진 엔터티
     */
    public TstEventImageEntity toEventImageEntiry(TstEventMeta dto) {
        return TstEventImageEntity.builder()
            .posX(dto.getImage().getPosX())
            .posY(dto.getImage().getPosY())
            .width(dto.getImage().getWidth())
            .height(dto.getImage().getHeight())
            .fileUrl(dto.getImage().getFileUrl())
            .build();
    }

}
