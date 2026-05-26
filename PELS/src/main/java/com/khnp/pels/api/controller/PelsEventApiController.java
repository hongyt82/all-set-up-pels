package com.khnp.pels.api.controller;

import com.khnp.pels.api.dto.*;
import com.khnp.pels.api.dto.group.ValidationGroups;
import com.khnp.pels.api.service.PdfService;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.api.validation.StrokeFilename;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.util.List;
import java.util.UUID;

/**
 * 수행기록 이벤트 관련 Api Controller
 * @author KwangYong
 * @since 2006-03-12
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class PelsEventApiController {

    private static final Logger logger = LoggerFactory.getLogger(PelsEventApiController.class);

    private final PelsEventService pelsEventService;

    private final PdfService pdfService;


    /**
     * 수행기록 이벤트 벌크 조회 (NO STROKE BINARY)
     * @param reqDto 이벤트 조회에 대한 요청 DTO
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TstEventResponse>>> getTstEventBulkList (
            @Validated(ValidationGroups.GroupEventBulk.class) TstEventSearchRequest reqDto
    ) throws Exception {
        logger.info("### getTstEventBulkList() PWPL_ID={} CHCK_SNO={} Start", reqDto.getPwplId(), reqDto.getChckSno());

        // 이벤트 목록 조회
        TstEventEntity paramEntity = new TstEventEntity();
        paramEntity.setPwplId(reqDto.getPwplId());
        paramEntity.setChckSno(reqDto.getChckSno());
        List<TstEventResponse> eventBulkList = pelsEventService.getTstEventBulkList(paramEntity);

        logger.info("### getTstEventBulkList() PWPL_ID={} CHCK_SNO={} End, events={}",
                reqDto.getPwplId(), reqDto.getChckSno(), eventBulkList.size());
        return ResponseEntity.ok().body(ApiResponse.success(eventBulkList));
    }

    /**
     * 페이지별 이벤트 스트로크 벌크 조회
     * @param reqDto 이벤트 조회에 대한 요청 DTO
     */
    @GetMapping( value = "/strokes")
    public void getTstEventStrokeByPageList (
            @Validated(ValidationGroups.GroupEventStroke.class) TstEventSearchRequest reqDto,
            HttpServletResponse response
    ) throws Exception {
        logger.info("### getTstEventStrokeByPageList() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} Start",
                reqDto.getPwplId(), reqDto.getChckSno(), reqDto.getPageCnt());

        String boundary = "----strokeBoundary" + UUID.randomUUID().toString().replaceAll("-", "");

        // 스트로크 목록 조회
        TstEventEntity paramEntity = new TstEventEntity();
        paramEntity.setPwplId(reqDto.getPwplId());
        paramEntity.setChckSno(reqDto.getChckSno());
        paramEntity.setPageCnt(reqDto.getPageCnt());
        List<TstEventStrokeEntity> tstStrokeEntityList = pelsEventService.getTstEventStrokeByPageList(paramEntity);
        logger.info("### getTstEventStrokeByPageList() PWPL_ID={} CHCK_SNO={} PAGE_CNT={}, strokes={}",
                reqDto.getPwplId(), reqDto.getChckSno(), reqDto.getPageCnt(), tstStrokeEntityList.size());

        // MultiPart 시작
        MultipartMixedWriter.begin(response, boundary);

        try (OutputStream os = response.getOutputStream()) {
            // files part (files로 여러개)
            int makeFileCnt = 0;
            for (TstEventStrokeEntity e : tstStrokeEntityList) {
                MultipartMixedWriter.writeBinaryPart(os, boundary,
                        StrokeFilename.responseFilename(e.getEventSno()), e.getLinePthDcr());
                makeFileCnt++;
            }
            logger.info("### getTstEventStrokeByPageList() PWPL_ID={} CHCK_SNO={} PAGE_CNT={}, Write files={}",
                    reqDto.getPwplId(), reqDto.getChckSno(), reqDto.getPageCnt(), makeFileCnt);

            // MultiPart 종료 (내부에서 flush)
            MultipartMixedWriter.end(os, boundary);
        }
        logger.info("### getTstEventStrokeByPageList() PWPL_ID={} CHCK_SNO={} PAGE_CNT={} End",
                reqDto.getPwplId(), reqDto.getChckSno(), reqDto.getPageCnt());
    }

    /**
     * 이벤트 목록 PDF 다운로드
     * @param reqDto 이벤트 목록 PDF 다운로드에 대한 요청 DTO
     */
    @GetMapping( value = "/pdf")
    public void downloadPdfTstEventList (
            @Validated(ValidationGroups.GroupEventBulk.class) TstEventSearchRequest reqDto,
            HttpServletResponse response
    ) throws Exception {
        logger.info("### downloadPdfTstEventList() PWPL_ID={} CHCK_SNO={} Start", reqDto.getPwplId(), reqDto.getChckSno());

        // 이벤트 목록 조회
        TstEventEntity paramEntity = new TstEventEntity();
        paramEntity.setPwplId(reqDto.getPwplId());
        paramEntity.setChckSno(reqDto.getChckSno());
        List<TstEventResponse> eventBulkList = pelsEventService.getTstEventBulkList(paramEntity);

        logger.info("### downloadPdfTstEventList() PWPL_ID={} CHCK_SNO={} Search End, events={}",
                reqDto.getPwplId(), reqDto.getChckSno(), eventBulkList.size());

        // PDF로 변환
        byte[] pdfBytes = pdfService.generatePdf(eventBulkList);

        logger.info("### downloadPdfTstEventList() PWPL_ID={} CHCK_SNO={} Converted to PDF",
                reqDto.getPwplId(), reqDto.getChckSno());

        // 응답 설정
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=tst_event_list_"+reqDto.getChckSno()+".pdf");
        response.setContentLength(pdfBytes.length);

        // 실제 응답
        OutputStream out = response.getOutputStream();
        out.write(pdfBytes);

        out.flush();
        out.close();
    }

}

