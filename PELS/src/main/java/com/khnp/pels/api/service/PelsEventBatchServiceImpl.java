package com.khnp.pels.api.service;

import com.khnp.pels.api.dao.PelsEventBatchDao;
import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventImageEntity;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 이벤트 Batch 서비스 구현
 * @author KwangYong
 * @since 2006-02-06
 */
@RequiredArgsConstructor
@Service("pelsBatchService")
public class PelsEventBatchServiceImpl implements PelsEventBatchService {

	private static final Logger logger = LoggerFactory.getLogger(PelsEventBatchServiceImpl.class);

	private final PelsEventBatchDao pelsEventBatchDao;

	private final PelsEventService pelsEventService;

	/**
	 * 수행기록 이벤트 Batch 저장
	 * @param eventEntityList 이벤트 객체 목록
	 * @return int 처리 개수
	 */
	public int saveTstEventBatch(List<TstEventEntity> eventEntityList) {

		int batchSize = 500;
		int flushSize = 50;

		for (int i = 0; i < eventEntityList.size(); i += batchSize) {

			int size = Math.min(batchSize, eventEntityList.size() - i);

			// Sequence 조회
			List<Long> eventSeqList = pelsEventService.getEventSeqList(size);

			// Insert
			for (int j = 0; j < size; j++) {

				TstEventEntity eventEntity = eventEntityList.get(i + j);

				Long seq = eventSeqList.get(j);

				// Event 입력
				eventEntity.setEventSno(seq);   // 이벤트 Key
				pelsEventBatchDao.insertTstEventBatch(eventEntity);

				// Event Stroke 입력
				if(eventEntity.getEventTypSqno().equals(3)) {
					TstEventStrokeEntity eventStrokeEntity = eventEntity.getStroke();
					eventStrokeEntity.setEventSno(seq);  // 이벤트 Key

					pelsEventBatchDao.insertTstEventStroke(eventStrokeEntity);
				}

				// Event Image 입력
				if(eventEntity.getEventTypSqno().equals(5)
					|| eventEntity.getEventTypSqno().equals(6)
				    || eventEntity.getEventTypSqno().equals(7)) {
					TstEventImageEntity imageEntity = eventEntity.getImage();
					imageEntity.setEventSno(seq);  // 이벤트 Key

					pelsEventBatchDao.insertTstEventImage(imageEntity);
				}

				// flush + 메모리 정리
				if(size%flushSize == 0) {
					pelsEventBatchDao.flush();
				}

			}

			// flush + 메모리 정리
			pelsEventBatchDao.flush();
		}

		return eventEntityList.size();
	}

}
