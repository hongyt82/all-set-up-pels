package com.khnp.pels.system.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository("mpssProcedureDAO")
public class PELSProcedureDAOImpl implements PELSProcedureDAO {
	@Autowired
	@Resource(name="sqlSession")
	private SqlSession sqlSession;

	@Override
	public List getList(String mapperId, HashMap<String, Object> map) {
		return sqlSession.selectList(mapperId, map);
	}
	
	@Override
	public Map getDetail(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return sqlSession.selectOne(mapperId, map);
	}

	@Override
	public int insert(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return sqlSession.insert(mapperId, map);
	}

	@Override
	public int update(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return sqlSession.update(mapperId, map);
	}

	@Override
	public int delete(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return sqlSession.delete(mapperId, map);
	}

	@Override
	public int getCount(String mapperId, HashMap<String, Object> map) {
		return sqlSession.selectOne(mapperId, map);
	}
	
	@Override
	public String getLastUnqKey(String mapperId) {
		return sqlSession.selectOne(mapperId);
	}	
}
