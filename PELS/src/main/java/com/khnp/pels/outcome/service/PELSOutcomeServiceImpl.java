package com.khnp.pels.outcome.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.khnp.pels.outcome.dao.PELSOutcomeDAO;

@Service("pelsOutcomeService")
public class PELSOutcomeServiceImpl implements PELSOutcomeService {

	@Autowired
	PELSOutcomeDAO pelsOutcomeDAO;
	
	@Override
	public List getList(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsOutcomeDAO.getList(mapperId, map);
	}
	
	@Override
	public Map getDetail(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsOutcomeDAO.getDetail(mapperId, map);
	}

	@Override
	public int insert(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsOutcomeDAO.insert(mapperId, map);
	}

	@Override
	public int update(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsOutcomeDAO.update(mapperId, map);
	}

	@Override
	public int delete(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsOutcomeDAO.delete(mapperId, map);
	}

	@Override
	public int getCount(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsOutcomeDAO.getCount(mapperId, map);
	}
}
