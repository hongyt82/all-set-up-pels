package com.khnp.pels.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.dto.TstEventImageEntity;
import com.khnp.pels.api.dto.TstEventImageMeta;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.common.exception.RestBadRequestException;
import com.khnp.pels.common.validation.JsonMetaBinder;
import com.khnp.pels.common.validation.JsonTypeFactory;
import com.khnp.pels.api.validation.StrokeFilename;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 수행기록 이벤트 사진 관련 Api Controller
 *
 * @author KwangYong
 * @since 2006-02-06
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class PelsImageApiController {

    private static final Logger logger = LoggerFactory.getLogger(PelsImageApiController.class);

    private final JsonMetaBinder jsonMetaBinder;

    private final JsonTypeFactory jsonTypeFactory;

    private final PelsEventService pelsEventService;


    /**
     * 수행기록 이벤트 사진 벌크 저장
     * @param metaJson 이벤트 사진 메타 JSON
     * @return ApiResponse
     */
    @PostMapping(
            value="/bulk",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveTstEventImageBulk (
            @RequestBody String metaJson
    ) {
        // meta json 변환 및 검증
        List<TstEventMeta> eventImageMetaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstEventMeta.class));
        logger.info("### saveTstEventImageBulk(), Request images={}", eventImageMetaList.size());

        // 이벤트 사진 저장
        int prcsCnt = pelsEventService.saveTstEventImageBulk(eventImageMetaList);
        logger.info("### saveTstEventImageBulk(), Completed save images={}", prcsCnt);

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 사진 단일 저장
     * @param metaJson 이벤트 사진 메터 JSON
     * @return ApiResponse
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveTstEventImage (
            @RequestBody String metaJson
    ) {
        // meta json 검증
        TstEventMeta eventImageMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventMeta.class));
        logger.info("### saveTstEventImage() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} IMG_ID={} Start",
                eventImageMeta.getPwplId(), eventImageMeta.getChckSno(), eventImageMeta.getPageNo(), eventImageMeta.getPageAddSeq(), eventImageMeta.getImgId());

        // 사진 저장
        pelsEventService.saveTstEventImage(eventImageMeta);
        logger.info("### saveTstEventImage() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} IMG_ID={}, Completed save stroke",
                eventImageMeta.getPwplId(), eventImageMeta.getChckSno(), eventImageMeta.getPageNo(), eventImageMeta.getPageAddSeq(), eventImageMeta.getImgId());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 사진 단일 삭제
     * @param metaJson 시험(점검) 스트로크 JSON 문자열
     * @return ApiResponse
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteTstEventImage (
            @RequestBody String metaJson
    ) {
        TstEventMeta eventImageMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventMeta.class));
        logger.info("### deleteTstEventImage() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} IMG_ID={} Start",
                eventImageMeta.getPwplId(), eventImageMeta.getChckSno(), eventImageMeta.getPageNo(), eventImageMeta.getPageAddSeq(), eventImageMeta.getImgId());

        // 사진 삭제
        pelsEventService.deleteTstEventImage(eventImageMeta);
        logger.info("### deleteTstEventImage() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} INSRTN_PAGE_CNT={} IMG_ID={}, Completed save stroke",
                eventImageMeta.getPwplId(), eventImageMeta.getChckSno(), eventImageMeta.getPageNo(), eventImageMeta.getPageAddSeq(), eventImageMeta.getImgId());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

}
