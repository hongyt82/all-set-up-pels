package com.khnp.pels.schedule.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.khnp.pels.schedule.dao.PELSScheduleDAO;

@Service("pelsScheduleService")
public class PELSScheduleServiceImpl implements PELSScheduleService {

	@Autowired
	PELSScheduleDAO pelsScheduleDAO;
	
	@Override
	public List getList(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsScheduleDAO.getList(mapperId, map);
	}
	
	@Override
	public Map getDetail(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsScheduleDAO.getDetail(mapperId, map);
	}

	@Override
	public int insert(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsScheduleDAO.insert(mapperId, map);
	}

	@Override
	public int update(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsScheduleDAO.update(mapperId, map);
	}

	@Override
	public int delete(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsScheduleDAO.delete(mapperId, map);
	}

	@Override
	public int getCount(String mapperId, HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return pelsScheduleDAO.getCount(mapperId, map);
	}
}
