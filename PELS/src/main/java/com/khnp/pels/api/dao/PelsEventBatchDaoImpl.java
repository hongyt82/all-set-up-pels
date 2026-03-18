package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstEventStrokeEntity;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.List;

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
	public int insertTstEventBatch(TstEventStrokeEntity eventEntity) {
		return batchSqlSession.insert("TstEventBatchInsert", eventEntity);
	}

	/**
	 * 이벤트 입력
	 * @param eventEntity 이벤트 객체
	 * @return 처리 개수
	 */
	@Override
	public int insertTstEvent(TstEventStrokeEntity eventEntity) {
		return batchSqlSession.insert("TstEventInsert", eventEntity);
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
	 * Batch Sql Session Flush
	 */
	@Override
	public void flush(){
		// flush + 메모리 정리
		batchSqlSession.flushStatements();
		batchSqlSession.clearCache();
	}

}
