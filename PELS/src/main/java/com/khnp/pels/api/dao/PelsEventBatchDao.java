package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventImageEntity;
import com.khnp.pels.api.dto.TstEventStrokeEntity;

/**
 * 이벤트 Batch DAO 인터페이스
 * @author KwangYong
 * @since 2006-02-06
 */
public interface PelsEventBatchDao {

	/**
	 * 이벤트 Batch 입력
	 * @param eventEntity 이벤트 객체
	 * @return 처리 개수
	 */
	int insertTstEventBatch(TstEventEntity eventEntity);

	/**
	 * 이벤트 스트로크 입력
	 * @param eventStrokeEntity 이벤트 스트로크 객체
	 * @return 처리 개수
	 */
	int insertTstEventStroke(TstEventStrokeEntity eventStrokeEntity);

	/**
	 * 이벤트 사진 입력
	 * @param eventImageEntity 이벤트 사진 객체
	 * @return 처리 개수
	 */
	int insertTstEventImage(TstEventImageEntity eventImageEntity);

	/**
	 * Batch Sql Session Flush
	 */
	void flush();

}
