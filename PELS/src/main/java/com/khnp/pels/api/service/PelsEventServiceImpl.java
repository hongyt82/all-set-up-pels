package com.khnp.pels.api.service;

import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dao.PelsEventDao;
import com.khnp.pels.api.dto.*;
import com.khnp.pels.common.exception.RestBadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("pelsEventService")
public class PelsEventServiceImpl implements PelsEventService {

	private static final Logger logger = LoggerFactory.getLogger(PelsEventServiceImpl.class);

	@Autowired
	PelsEventDao pelsEventDao;

	@Autowired
	PelsBatchService pelsBatchService;

	@Autowired
	PelsEventConverter pelsEventConverter;

	/**
	 * 수행기록 이벤트 벌크 목록 조회
	 * @param chckSno 시험고유키값
	 * @return List<TstEventStrokeEntity> 이벤트 엔터티 목록
	 */
	@Override
	public List<TstEventResponse> getTstEventBulkList(Long chckSno) {
		return pelsEventDao.selectTstEventList(chckSno);
	}
	
	/**
	 * 페이지별 이벤트 스트로크 목록 조회
	 * @param eventEntity 이벤트 객체
	 * @return 이벤트 스트로크 목록
	 */
	@Override
	public List<TstEventStrokeEntity> getTstEventStrokeByPageList(TstEventEntity eventEntity) {
		return pelsEventDao.selectTstEventStrokeByPageList(eventEntity);
	}

	/**
	 * 이벤트 시퀀스 목록 조회
	 * @param size 시퀀스 개수
	 * @return 시퀀스 목록
	 */
	@Override
	@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = {Exception.class})
	public List<Long> getEventSeqList(int size) {
		return pelsEventDao.getEventSeqList(size);
	}

	/**
	 * 수행기록 페이지 벌크 저장
	 * @param eventPageMetaList 이벤트 페이지 목록
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventPageBulk(List<TstEventMeta> eventPageMetaList) {
		// Batch Insert 호출
		return pelsBatchService.saveTstEventBatch(eventPageMetaList, null);
	}

	/**
	 * 수행기록 페이지 단일 저장
	 * @param eventPageMeta 이벤트 페이지 메타
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventPage(TstEventMeta eventPageMeta) {
		// Entity로 변환
		TstEventEntity eventPageEntity = pelsEventConverter.toEventEntity(eventPageMeta);

		return pelsEventDao.insertTstEvent(eventPageEntity);
	}

	/**
	 * 수행기록 페이지 단일 삭제
	 * @param eventPageMeta 이벤트 페이지 메타
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int deleteTstEventPage(TstEventMeta eventPageMeta) {
		// Entity로 변환
		TstEventEntity eventPageEntity = pelsEventConverter.toEventEntity(eventPageMeta);

		return pelsEventDao.insertTstEvent(eventPageEntity);
	}

	/**
	 * 수행기록 이벤트 스트로크 벌크 저장
	 * @param eventStrokeMetaList 이벤트 스트로크 메타 목록
	 * @param fileMap 이벤트 스트로크 바이너리 파일(s)
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventStrokeBulk(List<TstEventMeta> eventStrokeMetaList, Map<String, byte[]> fileMap) {
		// Batch Insert 호출
		return pelsBatchService.saveTstEventBatch(eventStrokeMetaList, fileMap);
	}

	/**
	 * 수행기록 이벤트 스트로크 단일 저장
	 * @param eventStrokeMeta 이벤트 스트로크 메타
	 * @param strokeFile 이벤트 스트로크 바이너리 파일
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventStroke(TstEventMeta eventStrokeMeta, byte[] strokeFile) {
		// Event Entity로 변환
		TstEventEntity eventEntity = pelsEventConverter.toEventEntity(eventStrokeMeta);
		// 이벤트 저장
		int prcsCnt = pelsEventDao.insertTstEvent(eventEntity);

		// Event Stroke Entity로 변환
		TstEventStrokeEntity eventStrokeEntity = pelsEventConverter.toEventStrokeEntity(eventStrokeMeta);
		eventStrokeEntity.setEventSno(eventEntity.getEventSno());  // 이벤트 일련번호
		eventStrokeEntity.setPointPath(strokeFile);  // 스트로크 바이너리 파일
		// 이벤트 스트로크 저장
		int prcsCnt2 = pelsEventDao.insertTstEventStroke(eventStrokeEntity);

		return (prcsCnt == 1 && prcsCnt2 == 1) ? 1 : 0;
	}

	/**
	 * 수행기록 이벤트 스트로크 단일 삭제
	 * @param eventStrokeMeta 이벤트 스트로크 메타
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int deleteTstEventStroke(TstEventMeta eventStrokeMeta) {
		// Event Entity로 변환
		TstEventEntity eventEntity = pelsEventConverter.toEventEntity(eventStrokeMeta);

		return pelsEventDao.insertTstEvent(eventEntity);
	}

	/**
	 * 수행기록 사진 벌크 저장
	 * @param eventImageMetaList 이벤트 사진 메타 목록
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventImageBulk(List<TstEventMeta> eventImageMetaList) {
		// Batch Insert 호출
		return pelsBatchService.saveTstEventBatch(eventImageMetaList, null);
	}

	/**
	 * 수행기록 사진 단일 저장
	 * @param eventImageMeta 이벤트 사진 메타
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventImage(TstEventMeta eventImageMeta) {
		// Event Entity로 변환
		TstEventEntity eventEntity = pelsEventConverter.toEventEntity(eventImageMeta);
		// 이벤트 저장
		int prcsCnt = pelsEventDao.insertTstEvent(eventEntity);

		// Event Image Entity로 변환
		TstEventImageEntity eventImageEntity = pelsEventConverter.toEventImageEntiry(eventImageMeta);
		eventImageEntity.setEventSno(eventEntity.getEventSno());  // 이벤트 일련번호
		// 이벤트 사진 저장
		int prcsCnt2 = pelsEventDao.insertTstEventImage(eventImageEntity);

		return (prcsCnt == 1 && prcsCnt2 == 1) ? 1 : 0;
	}

	/**
	 * 수행기록 사진 단일 삭제
	 * @param eventImageMeta 이벤트 사진 메타
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int deleteTstEventImage(TstEventMeta eventImageMeta) {
		// Event Entity로 변환
		TstEventEntity eventEntity = pelsEventConverter.toEventEntity(eventImageMeta);

		return pelsEventDao.insertTstEvent(eventEntity);
	}

}
