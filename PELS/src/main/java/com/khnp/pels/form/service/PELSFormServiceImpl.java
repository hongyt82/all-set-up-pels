package com.khnp.pels.form.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.khnp.pels.form.dao.PELSFormDAO;

@Service("pelsFormService")
public class PELSFormServiceImpl implements PELSFormService {
	
	@Autowired
	PELSFormDAO pelsFormDAO;
	
	@Override
	public List getList(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFormDAO.getList(mapperId, map);
	}
	
	@Override
	public Map getDetail(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFormDAO.getDetail(mapperId, map);
	}

	@Override
	public int insert(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFormDAO.insert(mapperId, map);
	}

	@Override
	public int update(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFormDAO.update(mapperId, map);
	}

	@Override
	public int delete(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFormDAO.delete(mapperId, map);
	}

	@Override
	public int getCount(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsFormDAO.getCount(mapperId, map);
	}
	
	@Override
	public String getLastUnqKey(String mapperId) {
		return pelsFormDAO.getLastUnqKey(mapperId);
	}
}
