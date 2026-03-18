package com.khnp.pels.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import com.khnp.pels.api.dto.TstEventStrokeMeta;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.common.exception.RestBadRequestException;
import com.khnp.pels.common.validation.JsonMetaBinder;
import com.khnp.pels.common.validation.JsonTypeFactory;
import com.khnp.pels.common.validation.StrokeFilename;
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

    private final ObjectMapper objectMapper;

    private final JsonMetaBinder jsonMetaBinder;

    private final JsonTypeFactory jsonTypeFactory;

    private final PelsEventService pelsEventService;

    private final PelsEventConverter pelsEventConverter;


    /**
     * 수행기록 이벤트 스트로크 벌크 저장
     * @param metaJson 이벤트 스트로크 JSON 문자열
     * @param mpFiles 이벤트 스트로크 포인트경로 바이너리 파일(s)
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
        List<TstEventStrokeMeta> eventStrokeMetaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstEventStrokeMeta.class));
        logger.info("### saveTstEventStrokeBulk(), Request strokes={}", eventStrokeMetaList.size());
        // Entity로 변환
        List<TstEventStrokeEntity> eventStrokeEntityList = pelsEventConverter.toStrokeEntityList(eventStrokeMetaList);

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
        int prcsCnt = pelsEventService.saveTstEventStrokeBulk(eventStrokeEntityList, fileMap);
        logger.info("### saveTstEventStrokeBulk(), Completed save strokes={}", prcsCnt);

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 스트로크 단일 저장
     * @param metaJson 이벤트 스트로크 메터 JSON
     * @param mpFile 이벤트 스트로크 포인트경로 파일
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
        TstEventStrokeMeta eventStrokeMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventStrokeMeta.class));
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Start",
                eventStrokeMeta.getTST_UNQ_KY_VAL(), eventStrokeMeta.getPAGE_NO(), eventStrokeMeta.getSTROKE_SEQ());
        // Entity로 변환
        TstEventStrokeEntity eventStrokeEntity = pelsEventConverter.toStrokeEntity(eventStrokeMeta);

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
        try {
            eventStrokeEntity.setPOINT_PATH(mpFile.getBytes());
        } catch (IOException e) {
            throw new RestBadRequestException("Failed to read file");
        }
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Checked stroke files",
                eventStrokeEntity.getTST_UNQ_KY_VAL(), eventStrokeEntity.getPAGE_NO(), eventStrokeEntity.getSTROKE_SEQ());

        //save stroke
        pelsEventService.saveTstEventStroke(eventStrokeEntity);
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Completed save stroke",
                eventStrokeEntity.getTST_UNQ_KY_VAL(), eventStrokeEntity.getPAGE_NO(), eventStrokeEntity.getSTROKE_SEQ());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 수행기록 이벤트 스트로크 단일 삭제
     * @param metaJson 시험(점검) 스트로크 JSON 문자열
     * @return ApiResponse
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteTstEventStroke (
            @RequestBody String metaJson
    ) {
        // meta json 파싱 검증
        TstEventStrokeMeta eventStrokeMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstEventStrokeMeta.class));
        logger.info("### deleteTstEventStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Start",
                eventStrokeMeta.getTST_UNQ_KY_VAL(), eventStrokeMeta.getPAGE_NO(), eventStrokeMeta.getSTROKE_SEQ());
        // Entity로 변환
        TstEventStrokeEntity eventStrokeEntity = pelsEventConverter.toStrokeEntity(eventStrokeMeta);

        // 스트로크 삭제
        int prcsCnt = pelsEventService.deleteTstEventStroke(eventStrokeEntity);
        if(prcsCnt == 0){
            logger.info("### deleteTstEventStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, No stroke found",
                    eventStrokeEntity.getTST_UNQ_KY_VAL(), eventStrokeEntity.getPAGE_NO(), eventStrokeEntity.getSTROKE_SEQ());
            return ResponseEntity.ok().body(ApiResponse.success("No stroke found to delete"));
        }
        logger.info("### deleteTstEventStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, End",
                eventStrokeEntity.getTST_UNQ_KY_VAL(), eventStrokeEntity.getPAGE_NO(), eventStrokeEntity.getSTROKE_SEQ());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

}
