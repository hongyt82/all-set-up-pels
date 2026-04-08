package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.dto.TstEventResponse;
import com.khnp.pels.api.dto.TstEventStrokeEntity;

import java.util.List;

/**
 * 이벤트 서비스 인터페이스
 * @author KwangYong
 * @since 2006-02-06
 */
public interface PelsEventService {

	/**
	 * 수행기록 이벤트 벌크 목록 조회
	 * @param eventEntity 이벤트 객체
	 * @return List<TstEventResponse> 이벤트 엔터티 목록
	 */
	List<TstEventResponse> getTstEventBulkList(TstEventEntity eventEntity);

	/**
	 * 페이지별 이벤트 스트로크 목록 조회
	 * @param eventEntity 이벤트 객체
	 * @return 이벤트 스트로크 목록
	 */
	List<TstEventStrokeEntity> getTstEventStrokeByPageList(TstEventEntity eventEntity);

	/**
	 * 이벤트 시퀀스 목록 조회
	 * @param size 시퀀스 개수
	 * @return 시퀀스 목록
	 */
	List<Long> getEventSeqList(int size);

	/**
	 * 수행기록 페이지 단일 저장
	 * @param eventPageMeta 이벤트 페이지 메타
	 * @return int 처리 개수
	 */
	int saveTstEventPage(TstEventMeta eventPageMeta);

	/**
	 * 수행기록 페이지 단일 삭제
	 * @param eventPageMeta 이벤트 페이지 메타
	 * @return int 처리 개수
	 */
	int deleteTstEventPage(TstEventMeta eventPageMeta);

	/**
	 * 수행기록 이벤트 스트로크 단일 저장
	 * @param eventEntity 이벤트 객체
	 * @return int 처리 개수
	 */
	int saveTstEventStroke(TstEventEntity eventEntity);

	/**
	 * 수행기록 이벤트 스트로크 단일 삭제
	 * @param eventStrokeMeta 이벤트 메타 객체
	 * @return int 처리 개수
	 */
	int deleteTstEventStroke(TstEventMeta eventStrokeMeta);

	/**
	 * 수행기록 이벤트 사진 단일 저장
	 * @param eventImageMeta 이벤트 사진 메타
	 * @return int 처리 개수
	 */
	int saveTstEventImage(TstEventMeta eventImageMeta);

	/**
	 * 수행기록 이벤트 사진 단일 삭제
	 * @param eventImageMeta 이벤트 사진 메타
	 * @return int 처리 개수
	 */
	int deleteTstEventImage(TstEventMeta eventImageMeta);

}
