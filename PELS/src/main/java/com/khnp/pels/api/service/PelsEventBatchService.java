package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventEntity;

import java.util.List;

/**
 * 이벤트 Batch 서비스 인터페이스
 * @author KwangYong
 * @since 2006-02-06
 */
public interface PelsEventBatchService {

	/**
	 * 수행기록 이벤트 Batch 저장
	 * @param eventEntityList 이벤트 객체 목록
	 * @return int 처리 개수
	 */
	int saveTstEventBatch(List<TstEventEntity> eventEntityList);

}
