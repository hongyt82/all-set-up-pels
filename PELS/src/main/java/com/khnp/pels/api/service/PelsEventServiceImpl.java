package com.khnp.pels.api.service;

import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dao.PelsEventDao;
import com.khnp.pels.api.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;import java.util.List;import java.util.Properties;

/**
 * 이벤트 서비스 구현
 * @author KwangYong
 * @since 2006-02-06
 */
@Service("pelsEventService")
public class PelsEventServiceImpl implements PelsEventService {

	private static final Logger logger = LoggerFactory.getLogger(PelsEventServiceImpl.class);

	@Resource(name = "utilProperties")
	private Properties utilProperties;

	@Autowired
	private PelsEventDao pelsEventDao;

	@Autowired
	private PelsEventConverter pelsEventConverter;

	/**
	 * 수행기록 이벤트 벌크 목록 조회
	 * @param eventEntity 이벤트 객체
	 * @return List<TstEventStrokeEntity> 이벤트 엔터티 목록
	 */
	@Override
	public List<TstEventResponse> getTstEventBulkList(TstEventEntity eventEntity) {
		List<TstEventResponse> tstEventBulkList = pelsEventDao.selectTstEventList(eventEntity);

		// 이미지 URL Prefix 포함
		String pelsIpUrl = utilProperties.getProperty("PELS_IP_URL");  // BASE URL
		for(TstEventResponse tstEvent : tstEventBulkList){
			switch(tstEvent.getEventTypSqno()) {
				case IMAGE_RESIZE:
				case IMAGE_UPSERT:
					if(tstEvent.getImage().getUrlInfo() != null && !tstEvent.getImage().getUrlInfo().isEmpty()) {
						tstEvent.getImage().setUrlInfo(pelsIpUrl + "/" + tstEvent.getImage().getUrlInfo());
					}
					break;
				default:
			}
		}

		return tstEventBulkList;
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
	 * 수행기록 이벤트 스트로크 단일 저장
	 * @param eventEntity 이벤트 객체
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventStroke(TstEventEntity eventEntity) {
		// 이벤트 저장
		int prcsCnt = pelsEventDao.insertTstEvent(eventEntity);

		// 이벤트 스트로크 저장
		TstEventStrokeEntity eventStrokeEntity = eventEntity.getStroke();
		eventStrokeEntity.setEventSno(eventEntity.getEventSno());  // 이벤트 일련번호
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
		TstEventImageEntity eventImageEntity = pelsEventConverter.toEventImageEntity(eventImageMeta);
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
