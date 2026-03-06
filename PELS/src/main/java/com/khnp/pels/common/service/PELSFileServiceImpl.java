package com.khnp.pels.common.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.khnp.pels.common.dao.PELSFileDAO;

@Service("pelsFileService")
public class PELSFileServiceImpl implements PELSFileService {

	@Autowired
	PELSFileDAO pelsFileDAO;
	
	@Override
	public List getList(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFileDAO.getList(mapperId, map);
	}
	
	@Override
	public Map getDetail(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFileDAO.getDetail(mapperId, map);
	}

	@Override
	public int insert(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFileDAO.insert(mapperId, map);
	}

	@Override
	public int update(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFileDAO.update(mapperId, map);
	}

	@Override
	public int delete(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFileDAO.delete(mapperId, map);
	}

	@Override
	public int getCount(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFileDAO.getCount(mapperId, map);
	}
}
