package com.khnp.pels.api.service;

import com.khnp.pels.api.dao.PelsEventBatchDao;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service("pelsBatchService")
public class PelsBatchServiceImpl implements PelsBatchService {

	private static final Logger logger = LoggerFactory.getLogger(PelsBatchServiceImpl.class);

	private final PelsEventBatchDao pelsEventBatchDao;

	private final PelsEventService pelsEventService;

	/**
	 * 수행기록 이벤트 Batch 저장
	 * @param list 이벤트 목록
	 * @return int 처리 개수
	 */
	public int saveTstEventBatch(List<TstEventStrokeEntity> list) {

		int batchSize = 1000;

		for (int i = 0; i < list.size(); i += batchSize) {

			int size = Math.min(batchSize, list.size() - i);

			// Sequence 조회
			List<Long> eventSeqList = pelsEventService.getEventSeqList(size);

			// Insert
			for (int j = 0; j < size; j++) {

				TstEventStrokeEntity entity = list.get(i + j);
				Long seq = eventSeqList.get(j);

				// Event 입력
				entity.setEVENT_SEQ(seq);
				pelsEventBatchDao.insertTstEventBatch(entity);

				// Event Stroke 입력
				if(entity.getEVENT_TYP().equals(3)) {
					pelsEventBatchDao.insertTstEventStroke(entity);
				}
			}

			// flush + 메모리 정리
			pelsEventBatchDao.flush();
		}

		return list.size();
	}

}
