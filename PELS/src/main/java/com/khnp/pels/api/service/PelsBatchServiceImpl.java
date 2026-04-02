package com.khnp.pels.api.service;

import com.khnp.pels.api.converter.PelsEventConverter;
import com.khnp.pels.api.dao.PelsEventBatchDao;
import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventImageEntity;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import com.khnp.pels.api.validation.StrokeFilename;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service("pelsBatchService")
public class PelsBatchServiceImpl implements PelsBatchService {

	private static final Logger logger = LoggerFactory.getLogger(PelsBatchServiceImpl.class);

	private final PelsEventBatchDao pelsEventBatchDao;

	private final PelsEventService pelsEventService;

	private final PelsEventConverter pelsEventConverter;

	/**
	 * 수행기록 이벤트 Batch 저장
	 * @param eventMetaList 이벤트 메타 목록
	 * @param fileMap 스트로크 파일 맵
	 * @return int 처리 개수
	 */
	public int saveTstEventBatch(List<TstEventMeta> eventMetaList, Map<String, byte[]> fileMap) {

		int batchSize = 500;
		int flushSize = 30;

		for (int i = 0; i < eventMetaList.size(); i += batchSize) {

			int size = Math.min(batchSize, eventMetaList.size() - i);

			// Sequence 조회
			List<Long> eventSeqList = pelsEventService.getEventSeqList(size);

			// Insert
			for (int j = 0; j < size; j++) {

				TstEventMeta eventMeta = eventMetaList.get(i + j);
				// Entity로 변환
				TstEventEntity eventEntity = pelsEventConverter.toEventEntity(eventMeta);

				Long seq = eventSeqList.get(j);

				// Event 입력
				eventEntity.setEventSno(seq);   // 이벤트 Key
				pelsEventBatchDao.insertTstEventBatch(eventEntity);

				// Event Stroke 입력
				if(eventEntity.getEventTypSqno().equals(3)) {
					// Entity로 변환
					TstEventStrokeEntity strokeEntity = pelsEventConverter.toEventStrokeEntity(eventMeta);

					// 이벤트 Key
					strokeEntity.setEventSno(seq);
					// Set stroke binary file
					String key = StrokeFilename.toFilename(eventMeta);
					strokeEntity.setLinePthDcr(fileMap.get(key));

					pelsEventBatchDao.insertTstEventStroke(strokeEntity);
				}

				// Event Image 입력
				if(eventEntity.getEventTypSqno().equals(5)
					|| eventEntity.getEventTypSqno().equals(6)
				    || eventEntity.getEventTypSqno().equals(7)) {
					// Entity로 변환
					TstEventImageEntity imageEntity = pelsEventConverter.toEventImageEntity(eventMeta);

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

		return eventMetaList.size();
	}

}
