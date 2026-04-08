package com.khnp.pels.api.controller;

import com.khnp.pels.api.dto.ApiResponse;
import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.service.PelsEventBatchService;
import com.khnp.pels.api.service.PelsEventService;
import com.khnp.pels.api.validation.EventType;
import com.khnp.pels.api.validation.StrokeFilename;
import com.khnp.pels.api.validation.ValidStrokeFile;
import com.khnp.pels.common.exception.RestBadRequestException;
import com.khnp.pels.common.validation.JsonMetaBinder;
import com.khnp.pels.common.validation.JsonTypeFactory;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 일단 생각해 본 부분에 대한 사항 그냥 버리기에는 아까우서 남김.
 * 통합 Bulk API (페이지/스트로크/이미지 이벤트 일괄 저장)
 * Request (multipart/form-data):
 * - meta: JSON array (List, TstEventMeta)
 * - files: (optional) stroke binary files
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class PelsUnifiedBulkApiController {

    private static final Logger logger = LoggerFactory.getLogger(PelsUnifiedBulkApiController.class);

    private final JsonMetaBinder jsonMetaBinder;
    private final JsonTypeFactory jsonTypeFactory;
    private final ValidStrokeFile validStrokeFile;

    /**
     * 통합 bulk는 트랜잭션/롤백 보장을 위해 @Transactional이 걸린 service 경로로 위임 및 현재의 위치에 선언한다.
     */
    private final PelsEventService pelsEventService;
    private final PelsEventBatchService pelsEventBatchService;

    @PostMapping(
            value = "/bulk",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> saveEventBulk(
            @RequestPart("meta") String metaJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> mpFiles
    ) {
        // meta json 변환 및 검증
        List<TstEventMeta> metaList = jsonMetaBinder.bindAndValidate(metaJson, jsonTypeFactory.listType(TstEventMeta.class));
        logger.info("### saveEventBulk(), Request meta={}", metaList.size());

        // 파일맵 생성 (없으면 empty)
        Map<String, byte[]> fileMap = (mpFiles == null || mpFiles.isEmpty()) ? Collections.emptyMap() : toStrokeFileMap(mpFiles);

        // STROKE_ADD는 바이너리 파일 필수 (batch 로직은 null을 허용하지 않음)
        validateStrokeFiles(metaList, fileMap);

        // 스트로크 파일 검증
        List<TstEventEntity> eventEntityList = validStrokeFile.validMappingEntityList(metaList, mpFiles);
        logger.info("### saveTstEventStrokeBulk(), Checked stroke files={}", eventEntityList.size());

        // NOTE: saveTstEventStrokeBulk는 내부에서 batch 저장을 호출하며 @Transactional(rollbackFor=Exception.class) 적용된 부분 확인.
        int prcsCnt = pelsEventBatchService.saveTstEventBatch(eventEntityList);
        logger.info("### saveEventBulk(), Completed save events={}", prcsCnt);

        return ResponseEntity.ok().body(ApiResponse.success());
    }

    private Map<String, byte[]> toStrokeFileMap(List<MultipartFile> mpFiles) {
        Map<String, byte[]> fileMap = new HashMap<>();

        for (MultipartFile file : mpFiles) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String original = file.getOriginalFilename();
            if (original == null || original.trim().isEmpty()) {
                throw new RestBadRequestException("Original filename is null");
            }

            // 파일명 체크 + 경로 제거
            StrokeFilename sf = StrokeFilename.parse(original);
            try {
                fileMap.put(sf.toFilename(), file.getBytes());
            } catch (IOException e) {
                throw new RestBadRequestException("Failed to read file");
            }
        }

        if (fileMap.isEmpty()) {
            return Collections.emptyMap();
        }

        return fileMap;
    }

    /**
     * 잘못된 Stroke Binary 들어갈때 예외 사항 처리
     * @param metaList
     * @param fileMap
     */
    private void validateStrokeFiles(List<TstEventMeta> metaList, Map<String, byte[]> fileMap) {
        for (TstEventMeta meta : metaList) {
            if (meta == null || meta.getEventTypSqno() == null) continue;

            if (meta.getEventTypSqno() == EventType.STROKE_ADD) {
                String key = StrokeFilename.toFilename(meta);
                byte[] bytes = fileMap.get(key);
                if (bytes == null || bytes.length == 0) {
                    throw new RestBadRequestException("Missing stroke binary file for: " + key);
                }
            }
        }
    }
}

