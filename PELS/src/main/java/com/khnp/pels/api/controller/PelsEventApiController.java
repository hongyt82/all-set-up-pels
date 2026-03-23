package com.khnp.pels.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventResponse;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.api.validation.StrokeFilename;
import com.khnp.pels.common.validation.JsonMetaBinder;
import com.khnp.pels.common.validation.JsonTypeFactory;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.util.List;
import java.util.UUID;

/**
 * 수행기록 이벤트 관련 Api Controller
 *
 * @author KwangYong
 * @since 2006-03-12
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class PelsEventApiController {

    private static final Logger logger = LoggerFactory.getLogger(PelsEventApiController.class);

    private final PelsEventService pelsEventService;


    /**
     * 수행기록 이벤트 벌크 조회 (NO STROKE BINARY)
     * @param tstUnqKyVal 시험고유키값
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TstEventResponse>>> getTstEventBulkList (
            @RequestParam("tstUnqKyVal") Long tstUnqKyVal
    ) throws Exception {
        logger.info("### getTstEventBulkList() TST_UNQ_KY_VAL={}, Start", tstUnqKyVal);

        // 이벤트 목록 조회
        List<TstEventResponse> eventBulkList = pelsEventService.getTstEventBulkList(tstUnqKyVal);

        logger.info("### getTstEventBulkList() TST_UNQ_KY_VAL={}, End events={}", tstUnqKyVal, eventBulkList.size());
        return ResponseEntity.ok().body(ApiResponse.success(eventBulkList));
    }

    /**
     * 페이지별 이벤트 스트로크 벌크 조회
     * @param tstUnqKyVal 시험고유키값
     */
    @GetMapping( value = "/strokes")
    public void getTstEventStrokeByPageList (
            @RequestParam("tstUnqKyVal") Long tstUnqKyVal,
            @RequestParam("pageNo") Integer pageNo,
            HttpServletResponse response
    ) throws Exception {
        logger.info("### getTstEventStrokeByPageList() TST_UNQ_KY_VAL={}, PAGE_NO={}, Start", tstUnqKyVal, pageNo);

        String boundary = "----strokeBoundary" + UUID.randomUUID().toString().replaceAll("-", "");

        // 스트로크 목록 조회
        TstEventEntity paramEntity = new TstEventEntity();
        paramEntity.setTstUnqKyVal(tstUnqKyVal);
        paramEntity.setPageNo(pageNo);
        List<TstEventStrokeEntity> tstStrokeEntityList = pelsEventService.getTstEventStrokeByPageList(paramEntity);
        logger.info("### getTstEventStrokeByPageList() TST_UNQ_KY_VAL={}, PAGE_NO={}, strokes={}", tstUnqKyVal, pageNo, tstStrokeEntityList.size());

        // MultiPart 시작
        MultipartMixedWriter.begin(response, boundary);

        try (OutputStream os = response.getOutputStream()) {
            // files part (files로 여러개)
            int makeFileCnt = 0;
            for (TstEventStrokeEntity e : tstStrokeEntityList) {
                MultipartMixedWriter.writeBinaryPart(os, boundary,
                        StrokeFilename.responseFilename(e.getEventSno()), e.getPointPath());
                makeFileCnt++;
            }
            logger.info("### getTstEventStrokeByPageList() TST_UNQ_KY_VAL={}, PAGE_NO={}, Write files={}", tstUnqKyVal, pageNo, makeFileCnt);

            // MultiPart 종료 (내부에서 flush)
            MultipartMixedWriter.end(os, boundary);
        }
        logger.info("### getTstEventStrokeByPageList() TST_UNQ_KY_VAL={}, PAGE_NO={}, End", tstUnqKyVal, pageNo);
    }

}
