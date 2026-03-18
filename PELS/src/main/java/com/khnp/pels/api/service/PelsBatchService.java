package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventStrokeEntity;

import java.util.List;
import java.util.Map;

public interface PelsBatchService {

	/**
	 * 수행기록 이벤트 Batch 저장
	 * @param eventList 이벤트 목록
	 * @return int 처리 개수
	 */
	int saveTstEventBatch(List<TstEventStrokeEntity> eventList);

}
