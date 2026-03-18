package com.khnp.pels.api.service;

import com.khnp.pels.api.dao.PelsEventDao;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
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

	/**
	 * 수행기록 이벤트 벌크 목록 조회
	 * @param tstUnqKyVal 시험고유키값
	 * @return List<TstEventStrokeEntity> 이벤트 엔터티 목록
	 */
	@Override
	public List<TstEventStrokeEntity> getTstEventBulkList(Long tstUnqKyVal) {
		return pelsEventDao.selectTstEventList(tstUnqKyVal);
	}
	
	/**
	 * 페이지별 이벤트 스트로크 목록 조회
	 * @param eventEntity 이벤트 객체
	 * @return 이벤트 스트로크 목록
	 */
	@Override
	public List<TstEventStrokeEntity> getTstEventStrokeByPageList(TstEventStrokeEntity eventEntity) {
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
	 * @param eventPageList 이벤트 페이지 목록
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventPageBulk(List<TstEventStrokeEntity> eventPageList) {
		// Batch Insert 호출
		return pelsBatchService.saveTstEventBatch(eventPageList);
	}

	/**
	 * 수행기록 페이지 단일 저장
	 * @param eventPageEntity 이벤트 페이지 객체
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventPage(TstEventStrokeEntity eventPageEntity) {
		return pelsEventDao.insertTstEvent(eventPageEntity);
	}

	/**
	 * 수행기록 페이지 단일 삭제
	 * @param eventPageEntity 이벤트 페이지 객체
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int deleteTstEventPage(TstEventStrokeEntity eventPageEntity) {
		return pelsEventDao.insertTstEvent(eventPageEntity);
	}

	/**
	 * 수행기록 이벤트 스트로크 벌크 저장
	 * @param tstEventStrokeList 이벤트 스트로크 객체
	 * @param fileMap 이벤트 스트로크 바이너리 파일(s)
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventStrokeBulk(List<TstEventStrokeEntity> tstEventStrokeList, Map<String, byte[]> fileMap) {
		// 바이너리 파일 매핑
		for(TstEventStrokeEntity entity : tstEventStrokeList){
			String key = "stroke_"+ entity.getTST_UNQ_KY_VAL()
					+ "_" + entity.getPAGE_NO()
					+ "_" + entity.getSTROKE_SEQ() + ".bin";
			byte[] file = fileMap.get(key);
			if(file == null || file.length == 0){
				throw new RestBadRequestException("File don't exist in fileMap");
			}
			entity.setPOINT_PATH(file);
		}

		// Batch Insert 호출
		return pelsBatchService.saveTstEventBatch(tstEventStrokeList);
	}

	/**
	 * 수행기록 이벤트 스트로크 단일 저장
	 * @param tstEventStrokeEntity 이벤트 스트로크 객체
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstEventStroke(TstEventStrokeEntity tstEventStrokeEntity) {
		// 이벤트 저장
		int prcsCnt = pelsEventDao.insertTstEvent(tstEventStrokeEntity);

		// 이벤트 스트로크 저장
		int prcsCnt2 = pelsEventDao.insertTstEventStroke(tstEventStrokeEntity);

		return (prcsCnt == 1 && prcsCnt2 == 1) ? 1 : 0;
	}

	/**
	 * 수행기록 이벤트 스트로크 단일 삭제
	 * @param tstEventStrokeEntity 이벤트 스트로크 객체
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int deleteTstEventStroke(TstEventStrokeEntity tstEventStrokeEntity) {
		return pelsEventDao.insertTstEvent(tstEventStrokeEntity);
	}

}
