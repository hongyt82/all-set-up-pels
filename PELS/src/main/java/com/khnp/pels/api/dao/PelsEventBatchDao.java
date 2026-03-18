package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstEventStrokeEntity;

import java.util.List;

public interface PelsEventBatchDao {

	/**
	 * 이벤트 Batch 입력
	 * @param eventEntity 이벤트 객체
	 * @return 처리 개수
	 */
	int insertTstEventBatch(TstEventStrokeEntity eventEntity);

	/**
	 * 이벤트 입력
	 * @param eventEntity 이벤트 객체
	 * @return 처리 개수
	 */
	int insertTstEvent(TstEventStrokeEntity eventEntity);

	/**
	 * 이벤트 스트로크 입력
	 * @param eventStrokeEntity 이벤트 스트로크 객체
	 * @return 처리 개수
	 */
	int insertTstEventStroke(TstEventStrokeEntity eventStrokeEntity);

	/**
	 * Batch Sql Session Flush
	 */
	void flush();

}
