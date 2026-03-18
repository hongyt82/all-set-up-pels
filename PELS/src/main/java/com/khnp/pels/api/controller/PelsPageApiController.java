package com.khnp.pels.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventPageMeta;
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

    private final ObjectMapper objectMapper;

    private final JsonMetaBinder jsonMetaBinder;

    private final JsonTypeFactory jsonTypeFactory;

    private final PelsEventService pelsEventService;

    private final PelsEventConverter pelsEventConverter;


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
        List<TstEventPageMeta> eventPageMetaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstEventPageMeta.class));
        logger.info("### saveTstEventPageBulk(), Request event pages={}", eventPageMetaList.size());
        // Entity로 변환
        List<TstEventStrokeEntity> eventPageList = pelsEventConverter.toPageEntityList(eventPageMetaList);

        // 이벤트 페이지 벌크 저장
        int prcsCnt = pelsEventService.saveTstEventPageBulk(eventPageList);
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
        TstEventPageMeta eventPageMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventPageMeta.class));
        logger.info("### saveTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={}, Start",
                eventPageMeta.getTST_UNQ_KY_VAL(), eventPageMeta.getPAGE_NO());
        // Entity로 변환
        TstEventStrokeEntity eventPageEntity = pelsEventConverter.toPageEntity(eventPageMeta);

        // 이벤트 페이지 저장
        pelsEventService.saveTstEventPage(eventPageEntity);
        logger.info("### saveTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={}, Completed save event page",
                eventPageEntity.getTST_UNQ_KY_VAL(), eventPageEntity.getPAGE_NO());

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
        TstEventPageMeta eventPageMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventPageMeta.class));
        logger.info("### deleteTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={}, Start",
                eventPageMeta.getTST_UNQ_KY_VAL(), eventPageMeta.getPAGE_NO());
        // Entity로 변환
        TstEventStrokeEntity eventPageEntity = pelsEventConverter.toPageEntity(eventPageMeta);

        // 이벤트 페이지 삭제
        int prcsCnt = pelsEventService.deleteTstEventPage(eventPageEntity);
        if(prcsCnt == 0){
            logger.info("### deleteTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={}, No event page found",
                    eventPageEntity.getTST_UNQ_KY_VAL(), eventPageEntity.getPAGE_NO());
            return ResponseEntity.ok().body(ApiResponse.success("No event page found to delete"));
        }
        logger.info("### deleteTstEventPage() TST_UNQ_KY_VAL={} PAGE_NO={}, End",
                eventPageEntity.getTST_UNQ_KY_VAL(), eventPageEntity.getPAGE_NO());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

}
