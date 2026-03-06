package com.khnp.pels.form.service;

import java.util.HashMap;

import org.springframework.web.multipart.MultipartHttpServletRequest;

public interface PELSFormLogicService {
	public String formSave(HashMap<String, Object> paramMap, MultipartHttpServletRequest mReq) throws Exception;
	
	public String formDelete(HashMap<String, Object> paramMap) throws Exception;
	
	public String formFileDelete(HashMap<String, Object> paramMap) throws Exception;
	
}
