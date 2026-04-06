package com.khnp.pels.api.validation;

import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.service.PelsEventServiceImpl;
import com.khnp.pels.common.exception.RestBadRequestException;
import lombok.AllArgsConstructor;
import lombok.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@AllArgsConstructor
@Component
public class ValidStrokeFile {

    private final PelsEventConverter pelsEventConverter;

    /**
     * 스트로크 파일 검증 및 Entity로 변환
     * @param eventMetaList 이벤트 메타 목록
     * @param mpFiles 스트로크 파일 목록
     * @return 이벤트 객체 목록
     */
    public List<TstEventEntity> validMappingEntityList(List<TstEventMeta> eventMetaList, List<MultipartFile> mpFiles) {

        // stroke path files 검증
        if(mpFiles==null || mpFiles.isEmpty()){
            throw new RestBadRequestException("MultipartFiles is empty");
        }

        // fileMap 생성
        Map<String, MultipartFile> fileMap = Optional.of(mpFiles)
                .orElse(Collections.emptyList())
                .stream()
                .collect(Collectors.toMap(
                        file -> StrokeFilename.baseFileName(file.getOriginalFilename()),
                        Function.identity()
                ));

        // 스트로크 파일 체크 및 Entity 생성
        return eventMetaList.stream()
                .map(meta -> {
                    if(meta.getEventTypSqno().equals(EventType.STROKE_ADD)){
                        String strkFileNm = StrokeFilename.toFilename(meta);
                        MultipartFile file = fileMap.get(strkFileNm);
                        if(file == null){
                            throw new RestBadRequestException("Stroke filename does not match meta: " + strkFileNm);
                        }

                        // Event Entity로 변환
                        TstEventEntity eventEntity = pelsEventConverter.toEventEntity(meta);

                        // Read stroke file
                        try {
                            eventEntity.getStroke().setLinePthDcr(file.getBytes());  // 스트로크 바이너리 파일
                        } catch (IOException e) {
                            throw new RestBadRequestException("Failed to read file");
                        }

                        return eventEntity;
                    } else if(meta.getEventTypSqno().equals(EventType.STROKE_DELETE)){
                        return pelsEventConverter.toEventEntity(meta);
                    } else {
                        throw new RestBadRequestException("Invalid event type");
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * 스트로크 파일 검증 및 Entity로 변환
     * @param eventMeta 이벤트 메타
     * @param mpFile 스트로크 파일
     * @return 이벤트 객체
     */
    public TstEventEntity validMappingEntity(TstEventMeta eventMeta, MultipartFile mpFile) {

        // stroke path file 검증
        if(mpFile==null || mpFile.isEmpty()){
            throw new RestBadRequestException("MultipartFile is empty");
        }

        // 스트로크 파일명 체크
        String original = mpFile.getOriginalFilename();
        StrokeFilename sf = StrokeFilename.parse(original);
        if(!original.equals(sf.toFilename())){
            throw new RestBadRequestException("Stroke filename does not match meta: " + original);
        }

        // Event Entity로 변환
        TstEventEntity eventEntity = pelsEventConverter.toEventEntity(eventMeta);
        
        // Read stroke file
        try {
            eventEntity.getStroke().setLinePthDcr(mpFile.getBytes());  // 스트로크 바이너리 파일
        } catch (IOException e) {
            throw new RestBadRequestException("Failed to read file");
        }

        return eventEntity;
    }

}