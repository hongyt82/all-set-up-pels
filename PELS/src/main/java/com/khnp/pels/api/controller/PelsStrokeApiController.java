package com.khnp.pels.api.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.api.validation.StrokeFilename;
import com.khnp.pels.common.exception.RestBadRequestException;
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

    private final PelsEventService pelsEventService;

    private final PelsEventConverter pelsEventConverter;


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
        List<TstEventMeta> eventStrokeMetaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstEventMeta.class));
        logger.info("### saveTstEventStrokeBulk(), Request strokes={}", eventStrokeMetaList.size());

        // stroke path files 검증
        if(mpFiles==null || mpFiles.isEmpty()){
            throw new RestBadRequestException("Stroke path files is empty");
        }

        // File Map으로 생성
        Map<String, byte[]> fileMap = new HashMap<>();
        for(MultipartFile file : mpFiles){
            String original = file.getOriginalFilename();
            if (original == null || original.trim().isEmpty()) {
                throw new RestBadRequestException("Original filename is null");
            }

            // 파일명 체크
            StrokeFilename sf = StrokeFilename.parse(original);  //경로 제거(C:\fakepath) 포함
            try {
                fileMap.put(sf.toFilename(), file.getBytes());
            } catch (IOException e) {
                throw new RestBadRequestException("Failed to read file");
            }
        }
        logger.info("### saveTstEventStrokeBulk(), Created file maps={}", fileMap.size());

        // 이벤트 스트로크 저장
        int prcsCnt = pelsEventService.saveTstEventStrokeBulk(eventStrokeMetaList, fileMap);
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
        TstEventMeta eventStrokeMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventMeta.class));
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={}  PAGE_ADD_SEQ={} STROKE_SEQ={}, Start",
                eventStrokeMeta.getChckSno(), eventStrokeMeta.getPageNo(), eventStrokeMeta.getPageAddSeq(), eventStrokeMeta.getStrokeSeq());

        // stroke path files 검증
        if(mpFile==null || mpFile.isEmpty()){
            throw new RestBadRequestException("Stroke path files is empty");
        }

        // 원 파일명 체크
        String original = mpFile.getOriginalFilename();
        if (original == null || original.trim().isEmpty()) {
            throw new RestBadRequestException("Original filename is null");
        }

        // 파일명 체크
        StrokeFilename.parse(original);
        byte[] strokeFile;
        try {
            strokeFile = mpFile.getBytes();
        } catch (IOException e) {
            throw new RestBadRequestException("Failed to read file");
        }
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={} STROKE_SEQ={}, Checked stroke file",
                eventStrokeMeta.getChckSno(), eventStrokeMeta.getPageNo(), eventStrokeMeta.getPageAddSeq(), eventStrokeMeta.getStrokeSeq());

        // 스트로크 저장
        pelsEventService.saveTstEventStroke(eventStrokeMeta, strokeFile);
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={} STROKE_SEQ={}, Completed save stroke",
                eventStrokeMeta.getChckSno(), eventStrokeMeta.getPageNo(), eventStrokeMeta.getPageAddSeq(), eventStrokeMeta.getStrokeSeq());

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
        logger.info("### deleteTstEventStroke() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={} STROKE_SEQ={}, Start",
                eventStrokeMeta.getChckSno(), eventStrokeMeta.getPageNo(), eventStrokeMeta.getPageAddSeq(), eventStrokeMeta.getStrokeSeq());

        // 스트로크 삭제
        pelsEventService.deleteTstEventStroke(eventStrokeMeta);
        logger.info("### deleteTstEventStroke() TST_UNQ_KY_VAL={} PAGE_NO={} PAGE_ADD_SEQ={} STROKE_SEQ={}, End",
                eventStrokeMeta.getChckSno(), eventStrokeMeta.getPageNo(), eventStrokeMeta.getPageAddSeq(), eventStrokeMeta.getStrokeSeq());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

}
