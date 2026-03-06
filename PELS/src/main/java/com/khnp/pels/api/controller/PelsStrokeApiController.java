package com.khnp.pels.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstCreateStrokeMeta;
import com.khnp.pels.api.dto.TstDeleteStrokeMeta;
import com.khnp.pels.api.dto.TstStrokeEntity;
import com.khnp.pels.api.service.PelsStrokeService;
import com.khnp.pels.common.exception.RestBadRequestException;
import com.khnp.pels.common.validation.JsonMetaBinder;
import com.khnp.pels.common.validation.JsonTypeFactory;
import com.khnp.pels.common.validation.StrokeFilename;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 절차서 시험(점검) 스트로크 관련 Api Controller
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

    private final PelsStrokeService pelsStrokeService;


    /**
     * 정주기 시험(점검) 스트로크 벌크 조회
     * @param tstUnqKyVal 시험고유키값
     */
    @GetMapping
    public void getTstStrokeBulk (
            @RequestParam("tstUnqKyVal") Long tstUnqKyVal,
            HttpServletResponse response
    ) throws Exception {
        logger.info("### getTstStrokeBulk() TST_UNQ_KY_VAL={}, Start", tstUnqKyVal);

        String boundary = "----strokeBoundary" + UUID.randomUUID().toString().replaceAll("-", "");

        // 스트로크 목록 조회
        List<TstStrokeEntity> tstStrokeEntityList = pelsStrokeService.getTstStrokeList(tstUnqKyVal);
        // Map List로 변환
        List<Map<String, Object>> tstStrokeMapList = pelsStrokeService.toMapList(tstStrokeEntityList);
        logger.info("### getTstStrokeBulk() TST_UNQ_KY_VAL={}, Select stroke={}", tstUnqKyVal, tstStrokeEntityList.size());

        // meta json으로 변환
        ApiResponse<List<Map<String, Object>>> meta;
        if(CollectionUtils.isEmpty(tstStrokeMapList)){
            meta = ApiResponse.success("Stroke not found", null);
        } else {
            meta = ApiResponse.success(tstStrokeMapList);
        }
        String metaJson = objectMapper.writeValueAsString(meta);

        // MultiPart 시작
        MultipartMixedWriter.begin(response, boundary);

        try (OutputStream os = response.getOutputStream()) {
            // meta part
            MultipartMixedWriter.writeJsonPart(os, boundary, "meta", "meta.json", metaJson);
            logger.info("### getTstStrokeBulk() TST_UNQ_KY_VAL={}, Write JSON", tstUnqKyVal);

            // files part (files로 여러개)
            int makeFileCnt = 0;
            for (TstStrokeEntity e : tstStrokeEntityList) {
                String filename = new StrokeFilename(
                    e.getTST_UNQ_KY_VAL() != null ? e.getTST_UNQ_KY_VAL() : 0,
                    e.getPAGE_NO() != null ? e.getPAGE_NO() : 0,
                    e.getSTROKE_SEQ() != null ? e.getSTROKE_SEQ() : 0
                ).toFilename();
                MultipartMixedWriter.writeBinaryPart(os, boundary, "files", filename, e.getPOINT_PATH());
                makeFileCnt++;
            }
            logger.info("### getTstStrokeBulk() TST_UNQ_KY_VAL={}, Write stroke files={}", tstUnqKyVal, makeFileCnt);

            // MultiPart 종료 (내부에서 flush)
            MultipartMixedWriter.end(os, boundary);
        }
        logger.info("### getTstStrokeBulk() TST_UNQ_KY_VAL={}, End", tstUnqKyVal);
    }

    /**
     * 정주기 시험(점검) 스트로크 벌크 저장
     * @param metaJson 시험 스트로크 메터데이터
     * @param mpFiles 스트로크 포인트경로 바이너리 파일(s)
     * @return ApiResponse
     */
    @PostMapping(
            value="/bulk",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveTstStrokeBulk (
            @RequestPart("meta") String metaJson,
            @RequestPart("files") List<MultipartFile> mpFiles
    ) {
        // meta json 변환 및 검증
        List<TstCreateStrokeMeta> tstCreateStrokeMetaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstCreateStrokeMeta.class));
        logger.info("### saveTstStrokeBulk(), Request stroke count={}", tstCreateStrokeMetaList.size());
        // Entity로 변환
        List<TstStrokeEntity> tstStrokeEntityList = pelsStrokeService.toEntityList(tstCreateStrokeMetaList);

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
        logger.info("### saveTstStrokeBulk(), Created file maps={}", fileMap.size());

        // 상세 검증 및 저장
        int prcsCnt = pelsStrokeService.saveTstStrokeBulk(tstStrokeEntityList, fileMap);
        logger.info("### saveTstStrokeBulk(), Completed save strokes={}", prcsCnt);

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 정주기 시험(점검) 단일 스트로크 저장
     * @param metaJson 스트로크 메터 JSON
     * @param mpFile 스트로크 포인트경로 파일
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
        TstCreateStrokeMeta tstCreateStrokeMeta = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstCreateStrokeMeta.class));
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Start",
                tstCreateStrokeMeta.getTST_UNQ_KY_VAL(), tstCreateStrokeMeta.getPAGE_NO(), tstCreateStrokeMeta.getSTROKE_SEQ());
        // Entity로 변환
        TstStrokeEntity tstStrokeEntity = pelsStrokeService.toInsertEntity(tstCreateStrokeMeta);

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
            tstStrokeEntity.setPOINT_PATH(mpFile.getBytes());
        } catch (IOException e) {
            throw new RestBadRequestException("Failed to read file");
        }
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Checked stroke file",
                tstCreateStrokeMeta.getTST_UNQ_KY_VAL(), tstCreateStrokeMeta.getPAGE_NO(), tstCreateStrokeMeta.getSTROKE_SEQ());

        //save stroke
        pelsStrokeService.saveTstStroke(tstStrokeEntity);
        logger.info("### saveTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Completed save stroke",
                tstCreateStrokeMeta.getTST_UNQ_KY_VAL(), tstCreateStrokeMeta.getPAGE_NO(), tstCreateStrokeMeta.getSTROKE_SEQ());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    /**
     * 정주기 시험(점검) 단일 스트로크 삭제
     * @param metaJson 시험(점검) 스트로크 JSON 문자열
     * @return ApiResponse
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteTstStroke (
            @RequestBody String metaJson
    ) {
        // meta json 파싱 검증
        TstDeleteStrokeMeta tstDeleteStrokeMeta
                = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.objectType(TstDeleteStrokeMeta.class));
        logger.info("### deleteTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, Start",
                tstDeleteStrokeMeta.getTST_UNQ_KY_VAL(), tstDeleteStrokeMeta.getPAGE_NO(), tstDeleteStrokeMeta.getSTROKE_SEQ());
        // Entity로 변환
        TstStrokeEntity tstStrokeEntity = pelsStrokeService.toDeleteEntity(tstDeleteStrokeMeta);

        // 스트로크 삭제
        int prcsCnt = pelsStrokeService.deleteTstStroke(tstStrokeEntity);
        if(prcsCnt == 0){
            logger.info("### deleteTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, No strokes found",
                    tstDeleteStrokeMeta.getTST_UNQ_KY_VAL(), tstDeleteStrokeMeta.getPAGE_NO(), tstDeleteStrokeMeta.getSTROKE_SEQ());
            return ResponseEntity.ok().body(ApiResponse.success("No strokes found to delete"));
        }
        logger.info("### deleteTstStroke() TST_UNQ_KY_VAL={} PAGE_NO={} STROKE_SEQ={}, End",
                tstDeleteStrokeMeta.getTST_UNQ_KY_VAL(), tstDeleteStrokeMeta.getPAGE_NO(), tstDeleteStrokeMeta.getSTROKE_SEQ());

        return ResponseEntity.ok().body(ApiResponse.success());
    }

}
