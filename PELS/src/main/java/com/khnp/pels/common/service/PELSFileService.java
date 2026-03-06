package com.khnp.pels.common.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface PELSFileService {
	public List getList (String mapperId, HashMap<String, Object> map);
	
	public Map getDetail (String mapperId, HashMap<String, Object> map);
	
	public int insert (String mapperId, HashMap<String, Object> map);
	
	public int update (String mapperId, HashMap<String, Object> map);
	
	public int delete (String mapperId, HashMap<String, Object> map);
	
	public int getCount (String mapperId, HashMap<String, Object> map);
}
