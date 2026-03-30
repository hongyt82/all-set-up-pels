package com.khnp.pels.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.common.validation.JsonMetaBinder;
import com.khnp.pels.common.validation.JsonTypeFactory;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 수행기록 이벤트 페이지 관련 Api Controller
 *
 * @author KwangYong
 * @since 2006-03-16
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pages")
public class PelsPageApiController {

    private static final Logger logger = LoggerFactory.getLogger(PelsPageApiController.class);

    private final JsonMetaBinder jsonMetaBinder;

    private final JsonTypeFactory jsonTypeFactory;

    private final PelsEventService pelsEventService;


    /**
     * 수행기록 이벤트 페이지 벌크 저장
     * @param metaJson 이벤트 페이지 메터 JSON
     * @return ApiResponse
     */
    @PostMapping(
            value="/bulk",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveTstEventPageBulk (
            @RequestBody String metaJson
    ) {
        // meta json 변환 및 검증
        List<TstEventMeta> eventPageMetaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstEventMeta.class));
        logger.info("### saveTstEventPageBulk(), Request event pages={}", eventPageMetaList.size());

        // 이벤트 페이지 벌크 저장
        int prcsCnt = pelsEventService.saveTstEventPageBulk(eventPageMetaList);
        logger.info("### saveTstEventPageBulk(), Completed save event pages={}", prcsCnt);

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 페이지 단일 저장
     * @param metaJson 이벤트 페이지 메터 JSON
     * @return ApiResponse
     */
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveTstEventPage (
            @RequestBody String metaJson
    ) {
        // meta json 검증
        TstEventMeta eventPageMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventMeta.class));
        logger.info("### saveTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={}, Start",
                eventPageMeta.getChckSno(), eventPageMeta.getPageNo(), eventPageMeta.getPageAddSeq());

        // 이벤트 페이지 저장
        pelsEventService.saveTstEventPage(eventPageMeta);
        logger.info("### saveTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={}, Completed save event page",
                eventPageMeta.getChckSno(), eventPageMeta.getPageNo(), eventPageMeta.getPageAddSeq());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 페이지 단일 삭제
     * @param metaJson 이벤트 페이지 메터 JSON
     * @return ApiResponse
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteTstEventPage (
            @RequestBody String metaJson
    ) {
        // meta json 파싱 검증
        TstEventMeta eventPageMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventMeta.class));
        logger.info("### deleteTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={}, Start",
                eventPageMeta.getChckSno(), eventPageMeta.getPageNo(), eventPageMeta.getPageAddSeq());

        // 이벤트 페이지 삭제
        int prcsCnt = pelsEventService.deleteTstEventPage(eventPageMeta);
        logger.info("### deleteTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={}, End",
                eventPageMeta.getChckSno(), eventPageMeta.getPageNo(), eventPageMeta.getPageAddSeq());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

}
