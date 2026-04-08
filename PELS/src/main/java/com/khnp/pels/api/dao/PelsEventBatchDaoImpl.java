package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventImageEntity;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;

/**
 * 이벤트 Batch DAO 구현
 * @author KwangYong
 * @since 2006-02-06
 */
@Repository("pelsEventBatchDao")
public class PelsEventBatchDaoImpl implements PelsEventBatchDao {

	@Resource(name="batchSqlSession")
	private SqlSession batchSqlSession;

	/**
	 * 이벤트 Batch 입력
	 * @param eventEntity 이벤트 객체
	 * @return 처리 개수
	 */
	@Override
	public int insertTstEventBatch(TstEventEntity eventEntity) {
		return batchSqlSession.insert("TstEventBatchInsert", eventEntity);
	}

	/**
	 * 이벤트 스트로크 입력
	 * @param eventStrokeEntity 이벤트 스트로크 객체
	 * @return 처리 개수
	 */
	@Override
	public int insertTstEventStroke(TstEventStrokeEntity eventStrokeEntity) {
		return batchSqlSession.insert("TstEventStrokeInsert", eventStrokeEntity);
	}

	/**
	 * 이벤트 사진 입력
	 * @param eventImageEntity 이벤트 사진 객체
	 * @return 처리 개수
	 */
	@Override
	public int insertTstEventImage(TstEventImageEntity eventImageEntity) {
		return batchSqlSession.insert("TstEventImageInsert", eventImageEntity);
	}

	/**
	 * Batch Sql Session Flush
	 */
	@Override
	public void flush(){
		// flush + 메모리 정리
		batchSqlSession.flushStatements();
		batchSqlSession.clearCache();
	}

}
