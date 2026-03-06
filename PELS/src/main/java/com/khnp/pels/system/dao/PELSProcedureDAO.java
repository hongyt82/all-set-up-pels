package com.khnp.pels.system.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface PELSProcedureDAO {
	public List getList (String mapperId, HashMap<String, Object> map);

	public Map getDetail (String mapperId, HashMap<String, Object> map);
	
	public int insert (String mapperId, HashMap<String, Object> map);
	
	public int update (String mapperId, HashMap<String, Object> map);
	
	public int delete (String mapperId, HashMap<String, Object> map);
	
	public int getCount (String mapperId, HashMap<String, Object> map);
	
	public String getLastUnqKey(String mapperId);
	
}
