package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventStrokeEntity;

import java.util.List;
import java.util.Map;

public interface PelsEventService {

	/**
	 * 수행기록 이벤트 벌크 목록 조회
	 * @param tstUnqKyVal 시험고유키값
	 * @return List<TstEventStrokeEntity> 이벤트 엔터티 목록
	 */
	List<TstEventStrokeEntity> getTstEventBulkList(Long tstUnqKyVal);

	/**
	 * 페이지별 이벤트 스트로크 목록 조회
	 * @param eventEntity 이벤트 객체
	 * @return 이벤트 스트로크 목록
	 */
	List<TstEventStrokeEntity> getTstEventStrokeByPageList(TstEventStrokeEntity eventEntity);

	/**
	 * 이벤트 시퀀스 목록 조회
	 * @param size 시퀀스 개수
	 * @return 시퀀스 목록
	 */
	List<Long> getEventSeqList(int size);

	/**
	 * 수행기록 페이지 벌크 저장
	 * @param eventPageList 이벤트 페이지 목록
	 * @return int 처리 개수
	 */
	int saveTstEventPageBulk(List<TstEventStrokeEntity> eventPageList);

	/**
	 * 수행기록 페이지 단일 저장
	 * @param eventPageEntity 이벤트 페이지 객체
	 * @return int 처리 개수
	 */
	int saveTstEventPage(TstEventStrokeEntity eventPageEntity);

	/**
	 * 수행기록 페이지 단일 삭제
	 * @param eventPageEntity 이벤트 페이지 객체
	 * @return int 처리 개수
	 */
	int deleteTstEventPage(TstEventStrokeEntity eventPageEntity);

	/**
	 * 수행기록 이벤트 스트로크 벌크 저장
	 * @param tstEventStrokeList 이벤트 스트로크 객체
	 * @param fileMap 이벤트 스트로크 바이너리 파일(s)
	 * @return int 처리 개수
	 */
	int saveTstEventStrokeBulk(List<TstEventStrokeEntity> tstEventStrokeList, Map<String, byte[]> fileMap);

	/**
	 * 수행기록 이벤트 스트로크 단일 저장
	 * @param tstEventStrokeEntity 이벤트 스트로크 객체
	 * @return int 처리 개수
	 */
	int saveTstEventStroke(TstEventStrokeEntity tstEventStrokeEntity);

	/**
	 * 수행기록 이벤트 스트로크 단일 삭제
	 * @param tstEventStrokeEntity 이벤트 스트로크 객체
	 * @return int 처리 개수
	 */
	int deleteTstEventStroke(TstEventStrokeEntity tstEventStrokeEntity);

}
