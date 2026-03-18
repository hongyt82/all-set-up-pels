package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstEventStrokeEntity;

import java.util.List;
import java.util.Map;

public interface PelsEventDao {

	/**
	 * 이벤트 목록 조회
	 * @param tstUnqKyVal 시험고유키값
	 * @return 이벤트 목록
	 */
	List<TstEventStrokeEntity> selectTstEventList(Long tstUnqKyVal);

	/**
	 * 페이지별 이벤트 스트로크 목록 조회
	 * @param entity 이벤트 스트로크 객체
	 * @return 스트로크 목록
	 */
	List<TstEventStrokeEntity> selectTstEventStrokeByPageList(TstEventStrokeEntity entity);

	/**
	 * 이벤트 시퀀스 목록 조회
	 * @param size 시퀀스 개수
	 * @return 시퀀스 목록
	 */
	List<Long> getEventSeqList(int size);

	/**
	 * 이벤트 입력
	 * @param entity 이벤트 객체
	 * @return 처리 개수
	 */
	int insertTstEvent(TstEventStrokeEntity entity);

	/**
	 * 이벤트 스트로크 입력
	 * @param entity 이벤트 스트로크 객체
	 * @return 처리 개수
	 */
	int insertTstEventStroke(TstEventStrokeEntity entity);

}
