package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.dto.TstEventResponse;
import com.khnp.pels.api.dto.TstEventStrokeEntity;

import java.util.List;
import java.util.Map;

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
	 * 수행기록 페이지 벌크 저장
	 * @param eventPageMetaList 이벤트 페이지 메타 목록
	 * @return int 처리 개수
	 */
	int saveTstEventPageBulk(List<TstEventMeta> eventPageMetaList);

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
	 * 수행기록 이벤트 스트로크 벌크 저장
	 * @param eventStrokeMetaList 이벤트 스트로크 메타 목록
	 * @param fileMap 이벤트 스트로크 바이너리 파일(s)
	 * @return int 처리 개수
	 */
	int saveTstEventStrokeBulk(List<TstEventMeta> eventStrokeMetaList, Map<String, byte[]> fileMap);

	/**
	 * 수행기록 이벤트 스트로크 단일 저장
	 * @param eventStrokeMeta 이벤트 메타 객체
	 * @param strokeFile 이벤트 스트로크 바이너리 파일
	 * @return int 처리 개수
	 */
	int saveTstEventStroke(TstEventMeta eventStrokeMeta, byte[] strokeFile);

	/**
	 * 수행기록 이벤트 스트로크 단일 삭제
	 * @param eventStrokeMeta 이벤트 메타 객체
	 * @return int 처리 개수
	 */
	int deleteTstEventStroke(TstEventMeta eventStrokeMeta);

	/**
	 * 수행기록 이벤트 사진 벌크 저장
	 * @param eventImageMetaList 이벤트 사진 메타 목록
	 * @return int 처리 개수
	 */
	int saveTstEventImageBulk(List<TstEventMeta> eventImageMetaList);

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
