package com.khnp.pels.system.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.khnp.pels.system.dao.PELSProcedureDAO;

@Service("pelsProcedureService")
public class PELSProcedureServiceImpl implements PELSProcedureService {
	
	@Autowired
	PELSProcedureDAO pelsProcedureDAO;
	
	@Override
	public List getList(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsProcedureDAO.getList(mapperId, map);
	}
	
	@Override
	public Map getDetail(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsProcedureDAO.getDetail(mapperId, map);
	}

	@Override
	public int insert(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsProcedureDAO.insert(mapperId, map);
	}

	@Override
	public int update(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsProcedureDAO.update(mapperId, map);
	}

	@Override
	public int delete(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsProcedureDAO.delete(mapperId, map);
	}

	@Override
	public int getCount(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsProcedureDAO.getCount(mapperId, map);
	}
	
	@Override
	public String getLastUnqKey(String mapperId) {
		return pelsProcedureDAO.getLastUnqKey(mapperId);
	}
}
