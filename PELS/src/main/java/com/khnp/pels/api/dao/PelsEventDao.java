package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.*;

import java.util.List;

public interface PelsEventDao {

	/**
	 * 이벤트 목록 조회
	 * @param eventEntity 이벤트 스트로크 객체
	 * @return 이벤트 목록
	 */
	List<TstEventResponse> selectTstEventList(TstEventEntity eventEntity);

	/**
	 * 페이지별 이벤트 스트로크 목록 조회
	 * @param eventEntity 이벤트 스트로크 객체
	 * @return 스트로크 목록
	 */
	List<TstEventStrokeEntity> selectTstEventStrokeByPageList(TstEventEntity eventEntity);

	/**
	 * 이벤트 시퀀스 목록 조회
	 * @param size 시퀀스 개수
	 * @return 시퀀스 목록
	 */
	List<Long> getEventSeqList(int size);

	/**
	 * 이벤트 입력
	 * @param eventEntity 이벤트 객체
	 * @return 처리 개수
	 */
	int insertTstEvent(TstEventEntity eventEntity);

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

}
