package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventImageEntity;
import com.khnp.pels.api.dto.TstEventResponse;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.List;

@Repository("pelsEventDao")
public class PelsEventDaoImpl implements PelsEventDao {
	
	@Resource(name="sqlSession")
	private SqlSession sqlSession;


	/**
	 * 이벤트 목록 조회
	 * @param chckSno 시험고유키값
	 * @return 이벤트 목록
	 */
	@Override
	public List<TstEventResponse> selectTstEventList(Long chckSno) {
		return sqlSession.selectList("TstEventSelectList", chckSno);
	}

	/**
	 * 페이지별 이벤트 스트로크 목록 조회
	 * @param entity 이벤트 스트로크 객체
	 * @return 스트로크 목록
	 */
	@Override
	public List<TstEventStrokeEntity> selectTstEventStrokeByPageList(TstEventEntity entity) {
		return sqlSession.selectList("TstEventStrokeByPageList", entity);
	}

	/**
	 * 이벤트 시퀀스 목록 조회
	 * @param size 시퀀스 개수
	 * @return 시퀀스 목록
	 */
	@Override
	public List<Long> getEventSeqList(int size) {
		return sqlSession.selectList("TstEventSeqSelectList", size);
	}

	/**
	 * 이벤트 입력
	 * @param entity 이벤트 객체
	 * @return 처리 개수
	 */
	@Override
	public int insertTstEvent(TstEventEntity entity) {
		return sqlSession.insert("TstEventInsert", entity);
	}

	/**
	 * 이벤트 스트로크 입력
	 * @param entity 이벤트 스트로크 객체
	 * @return 처리 개수
	 */
	@Override
	public int insertTstEventStroke(TstEventStrokeEntity entity) {
		return sqlSession.insert("TstEventStrokeInsert", entity);
	}

	/**
	 * 이벤트 사진 입력
	 * @param entity 이벤트 사진 객체
	 * @return 처리 개수
	 */
	@Override
	public int insertTstEventImage(TstEventImageEntity entity) {
		return sqlSession.insert("TstEventImageInsert", entity);
	}

}
