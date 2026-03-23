package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.dto.TstEventStrokeEntity;

import java.util.List;
import java.util.Map;

public interface PelsBatchService {

	/**
	 * 수행기록 이벤트 Batch 저장
	 * @param eventMetaList 이벤트 메타 목록
	 * @param fileMap 스트로크 파일 맵
	 * @return int 처리 개수
	 */
	int saveTstEventBatch(List<TstEventMeta> eventMetaList, Map<String, byte[]> fileMap);

}
