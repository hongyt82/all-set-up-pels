package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstStrokeEntity;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.List;

@Repository("mpssStrokeDao")
public class PelsStrokeDaoImpl implements PelsStrokeDao {
	
	@Autowired
	@Resource(name="sqlSession")
	private SqlSession sqlSession;


	@Override
	public List<TstStrokeEntity> getTstStrokeList(String mapperId, Long tstUnqKyVal) {
		return sqlSession.selectList(mapperId, tstUnqKyVal);
	}

	@Override
	public int insertTstStroke(String mapperId, TstStrokeEntity tstStrokeEntity) {
		return sqlSession.insert(mapperId, tstStrokeEntity);
	}

	@Override
	public int updateTstStrokeForDelete(String mapperId, TstStrokeEntity tstStrokeEntity) {
		return sqlSession.update(mapperId, tstStrokeEntity);
	}

}
