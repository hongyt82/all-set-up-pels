package com.khnp.pels.api.controller;

import java.util.List;

import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.service.PelsEventBatchService;
import com.khnp.pels.api.service.PelsEventBatchServiceImpl;
import com.khnp.pels.api.validation.ValidStrokeFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.common.validation.JsonMetaBinder;
import com.khnp.pels.common.validation.JsonTypeFactory;

import lombok.RequiredArgsConstructor;

/**
 * 수행기록 이벤트 스트로크 관련 Api Controller
 *
 * @author KwangYong
 * @since 2006-02-06
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/strokes")
public class PelsStrokeApiController {

    private static final Logger logger = LoggerFactory.getLogger(PelsStrokeApiController.class);

    private final JsonMetaBinder jsonMetaBinder;

    private final JsonTypeFactory jsonTypeFactory;

    private final ValidStrokeFile validStrokeFile;

    private final PelsEventService pelsEventService;

    private final PelsEventBatchService pelsEventBatchService;


    /**
     * 수행기록 이벤트 스트로크 벌크 저장
     * @param metaJson 이벤트 스트로크 JSON 
     * @param mpFiles 이벤트 스트로크 바이너리 파일(s)
     * @return ApiResponse
     */
    @PostMapping(
            value="/bulk",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveTstEventStrokeBulk (
            @RequestPart("meta") String metaJson,
            @RequestPart("files") List<MultipartFile> mpFiles
    ) {
        // meta json 변환 및 검증
        List<TstEventMeta> eventMetaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstEventMeta.class));
        logger.info("### saveTstEventStrokeBulk(), Request strokes={}", eventMetaList.size());

        // 스트로크 파일 검증
        List<TstEventEntity> eventEntityList = validStrokeFile.validMappingEntityList(eventMetaList, mpFiles);
        logger.info("### saveTstEventStrokeBulk(), Checked stroke files={}", eventEntityList.size());

        // 스트로크 이벤트 저장
        int prcsCnt = pelsEventBatchService.saveTstEventBatch(eventEntityList);
        logger.info("### saveTstEventStrokeBulk(), Completed save strokes={}", prcsCnt);

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 스트로크 단일 저장
     * @param metaJson 이벤트 스트로크 메터 JSON
     * @param mpFile 이벤트 스트로크 바이너리 파일
     * @return ApiResponse
     */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveTstStroke (
            @RequestPart("meta") String metaJson,
            @RequestPart("file") MultipartFile mpFile
    ) {
        // meta json 검증
        TstEventMeta eventMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventMeta.class));
        logger.info("### saveTstStroke() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} PDF_PAGE_CNT={} STRK_SEQ={} Start",
                eventMeta.getPwplId(), eventMeta.getChckSno(), eventMeta.getPageCnt(), eventMeta.getInsrtnPageCnt(), eventMeta.getPdfPageCnt(), eventMeta.getStrkSeq());

        // 스트로크 파일 검증
        TstEventEntity eventEntity = validStrokeFile.validMappingEntity(eventMeta, mpFile);
        logger.info("### saveTstStroke() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} PDF_PAGE_CNT={} STRK_SEQ={}, Checked stroke file",
                eventMeta.getPwplId(), eventMeta.getChckSno(), eventMeta.getPageCnt(), eventMeta.getInsrtnPageCnt(), eventMeta.getPdfPageCnt(), eventMeta.getStrkSeq());

        // 스트로크 이벤트 저장
        pelsEventService.saveTstEventStroke(eventEntity);
        logger.info("### saveTstStroke() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} PDF_PAGE_CNT={} STRK_SEQ={} End",
                eventMeta.getPwplId(), eventMeta.getChckSno(), eventMeta.getPageCnt(), eventMeta.getInsrtnPageCnt(), eventMeta.getPdfPageCnt(), eventMeta.getStrkSeq());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 스트로크 단일 삭제
     * @param metaJson 이벤트 스트로크 JSON
     * @return ApiResponse
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteTstEventStroke (
            @RequestBody String metaJson
    ) {
        // meta json 파싱 검증
        TstEventMeta eventStrokeMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventMeta.class));
        logger.info("### deleteTstEventStroke() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} PDF_PAGE_CNT={} STRK_SEQ={} Start",
                eventStrokeMeta.getPwplId(), eventStrokeMeta.getChckSno(), eventStrokeMeta.getPageCnt(), eventStrokeMeta.getInsrtnPageCnt(), eventStrokeMeta.getPdfPageCnt(), eventStrokeMeta.getStrkSeq());

        // 스트로크 삭제
        pelsEventService.deleteTstEventStroke(eventStrokeMeta);
        logger.info("### deleteTstEventStroke() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} PDF_PAGE_CNT={} STRK_SEQ={} End",
                eventStrokeMeta.getPwplId(), eventStrokeMeta.getChckSno(), eventStrokeMeta.getPageCnt(), eventStrokeMeta.getInsrtnPageCnt(), eventStrokeMeta.getPdfPageCnt(), eventStrokeMeta.getStrkSeq());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

}
