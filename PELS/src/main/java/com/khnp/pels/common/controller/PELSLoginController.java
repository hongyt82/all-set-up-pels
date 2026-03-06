package com.khnp.pels.common.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.net.URLEncoder;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.util.FileCopyUtils;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;


import com.google.gson.JsonObject;
import com.khnp.pels.common.dto.CommonFileDTO;
import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.service.PELSFileLogicService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.xss.JsonXssFilter;
import common.util.*;

@Controller
public class PELSLoginController {
	private static final Logger log = LoggerFactory.getLogger(PELSLoginController.class);

	@Autowired
	private PELSFileLogicService pelsFileLogicService;
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;	

	@Resource(name = "utilProperties")
	private Properties utilProperties;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();	
	
	@RequestMapping(value="LoginSSO.do", method = {RequestMethod.GET, RequestMethod.POST})
	public String LoginSSO (HttpServletRequest request) {
		return "/pels/ssoVerifyToken";
	}
	
	@RequestMapping(value="Logout.do", method = {RequestMethod.GET, RequestMethod.POST})
	public String PELSLogout (HttpServletRequest request) {
		request.getSession().invalidate();
		return "redirect:/index.do";
	}	
	
	@RequestMapping(value="PELS_loginChk.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map loginChk(HttpServletRequest request) {
		Map resultMap = new HashMap<String, Object>();
		
		String WMSS_URL = utilProperties.getProperty("WMSS_URL");
		String LOGIN_ID = StringUtil.nvl(request.getParameter("LOGIN_ID"), "");
		
		// 임시
		if(1 == 1) {
			HttpSession session = request.getSession();
			session.setAttribute("LOGIN_USER_ID", "M1EU0001");
			session.setAttribute("LOGIN_USER_NM", "개발자");
			session.setAttribute("LOGIN_USER_DEPT_NM", "기술PI부");
			session.setAttribute("GRADE",  "001");
			
			resultMap.put("result", "success");
			
			return resultMap;
		}
		
		HashMap paramMap = new HashMap<String, Object>();
		paramMap.put("LOGIN_ID", LOGIN_ID);
		HttpConnectionUtil HUtil = new HttpConnectionUtil();
	    String result = HUtil.postRequest(WMSS_URL + "/LoginJson.do", paramMap);	
	    
	    JSONParser parser = new JSONParser();
	    JSONArray jsonArr = null;
	    JSONObject userInfo = null;
	    try {
		    Object obj = parser.parse(result);
		    userInfo = (JSONObject) obj;
	    } catch (Exception ex) {
	    }
	    
		if (userInfo != null) {
			HttpSession session = request.getSession();
			session.setAttribute("LOGIN_USER_ID", userInfo.get("USER_ID"));
			session.setAttribute("LOGIN_USER_NM", userInfo.get("USER_NAME"));
			session.setAttribute("LOGIN_USER_ENG_NM", userInfo.get("ENG_NAME"));
			session.setAttribute("LOGIN_USER_DEPT_CD", userInfo.get("DEPT_CD"));
			session.setAttribute("LOGIN_USER_DEPT_NM", userInfo.get("DEPT_NM"));
			session.setAttribute("LOGIN_USER_EMGRD", userInfo.get("EMGRD"));
			session.setAttribute("LOGIN_USER_EMGRD_NM", userInfo.get("EMGRD_NM"));
			session.setAttribute("LOGIN_USER_JIKWI", userInfo.get("JIKWI"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE", userInfo.get("TYPE_CD"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE_NM", userInfo.get("TYPE_DESC"));
			session.setAttribute("LOGIN_USER_PLANT_CD", userInfo.get("PLANT"));
			session.setAttribute("LOGIN_USER_PLANT_NM", userInfo.get("PLANT_DESC"));
			session.setAttribute("LOGIN_USER_UNIT_TYPE", userInfo.get("UNIT_TYPE"));
			session.setAttribute("LOGIN_USER_BONSA_GUBUN", userInfo.get("BONSA_GUBUN"));
			session.setAttribute("LOGIN_USER_JIKJE1", userInfo.get("JIKJE1"));
			session.setAttribute("LOGIN_USER_JIKJE2", userInfo.get("JIKJE2"));
			session.setAttribute("LOGIN_USER_JIKJE3", userInfo.get("JIKJE3"));
			session.setAttribute("LOGIN_USER_JIKJE4", userInfo.get("JIKJE4"));
			session.setAttribute("LOGIN_USER_JIKJE5", userInfo.get("JIKJE5"));
			session.setAttribute("LOGIN_USER_JJTXT1", userInfo.get("JJTXT1"));
			session.setAttribute("LOGIN_USER_JJTXT2", userInfo.get("JJTXT2"));
			session.setAttribute("LOGIN_USER_JJTXT3", userInfo.get("JJTXT3"));
			session.setAttribute("LOGIN_USER_JJTXT4", userInfo.get("JJTXT4"));
			session.setAttribute("LOGIN_USER_JJTXT5", userInfo.get("JJTXT5"));
			String LOGIN_USER_JIKJE = "";
			if (!StringUtil.isNull((String) userInfo.get("JIKJE1"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE1");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE2"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE2");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE3"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE3");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE4"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE4");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE5"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE5");
			session.setAttribute("LOGIN_USER_JIKJE", LOGIN_USER_JIKJE);
			session.setAttribute("LOGIN_USER_CEL_TEL", userInfo.get("CEL_TEL"));
			
			//String AUTH_CD = StringUtil.nvl((String)userInfo.get("AUTH_CD"), "");
			//if ( LOGIN_ID.equals("M1EU0004")) AUTH_CD = "ZLEG_GE_WMSS_001";
			//session.setAttribute("LOGIN_USER_AUTH", AUTH_CD);
			
			// 권한을 가져온다.
			paramMap.put("USER_ID", userInfo.get("USER_ID"));
			Map<String, String> gradeDetail = pelsFormService.getDetail("GradeDetail", paramMap);
			if(gradeDetail != null) {
				session.setAttribute("GRADE",  gradeDetail.get("ATTY_CFY"));
			}
			else {
				session.setAttribute("GRADE", "");
			}
			
			session.setMaxInactiveInterval(60*60*100);
			
			String sIP = request.getRemoteAddr();
			HashMap<String, Object> map = new HashMap<String, Object>();
			map.put("PPCD", userInfo.get("PLANT"));
			map.put("TYPE_CD", "LOGIN");
			map.put("RG_SCCD", LOGIN_USER_JIKJE);
			map.put("HOLD_SCCD", userInfo.get("DEPT_CD"));
			map.put("DOC_UNQ_ID", "");
			map.put("SYS_ACSS_CFY_CD", "WEB");
			map.put("RMK", "");
			map.put("REGPR_IP_ADDR", sIP);
			map.put("REGPR_ID", userInfo.get("USER_ID"));
			map.put("REGPR_NM", userInfo.get("USER_NAME"));

			pelsFormService.insert("SetUsecase", map);
			
			resultMap.put("result", "success");
		} else {
			resultMap.put("result", "fail");
		}
		
		return resultMap;
	}
	
	@RequestMapping(value="Login.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Login (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("sabun");
		String WMSS_URL = utilProperties.getProperty("WMSS_URL");

		HashMap paramMap = new HashMap<String, Object>();
		
		paramMap.put("LOGIN_ID", USER_ID);
		HttpConnectionUtil HUtil = new HttpConnectionUtil();
	    String result = HUtil.postRequest(WMSS_URL + "/LoginJson.do", paramMap);	
	    
	    JSONParser parser = new JSONParser();
	    JSONArray jsonArr = null;
	    JSONObject userInfo = null;
	    try {
		    Object obj = parser.parse(result);
		    userInfo = (JSONObject) obj;
	    } catch (Exception ex) {
	    }
		if (userInfo != null) {
			session.setAttribute("LOGIN_USER_ID", userInfo.get("USER_ID"));
			session.setAttribute("LOGIN_USER_NM", userInfo.get("USER_NAME"));
			session.setAttribute("LOGIN_USER_ENG_NM", userInfo.get("ENG_NAME"));
			session.setAttribute("LOGIN_USER_DEPT_CD", userInfo.get("DEPT_CD"));
			session.setAttribute("LOGIN_USER_DEPT_NM", userInfo.get("DEPT_NM"));
			session.setAttribute("LOGIN_USER_EMGRD", userInfo.get("EMGRD"));
			session.setAttribute("LOGIN_USER_EMGRD_NM", userInfo.get("EMGRD_NM"));
			session.setAttribute("LOGIN_USER_JIKWI", userInfo.get("JIKWI"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE", userInfo.get("TYPE_CD"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE_NM", userInfo.get("TYPE_DESC"));
			session.setAttribute("LOGIN_USER_PLANT_CD", userInfo.get("PLANT"));
			session.setAttribute("LOGIN_USER_PLANT_NM", userInfo.get("PLANT_DESC"));
			session.setAttribute("LOGIN_USER_UNIT_TYPE", userInfo.get("UNIT_TYPE"));
			session.setAttribute("LOGIN_USER_BONSA_GUBUN", userInfo.get("BONSA_GUBUN"));
			session.setAttribute("LOGIN_USER_JIKJE1", userInfo.get("JIKJE1"));
			session.setAttribute("LOGIN_USER_JIKJE2", userInfo.get("JIKJE2"));
			session.setAttribute("LOGIN_USER_JIKJE3", userInfo.get("JIKJE3"));
			session.setAttribute("LOGIN_USER_JIKJE4", userInfo.get("JIKJE4"));
			session.setAttribute("LOGIN_USER_JIKJE5", userInfo.get("JIKJE5"));
			session.setAttribute("LOGIN_USER_JJTXT1", userInfo.get("JJTXT1"));
			session.setAttribute("LOGIN_USER_JJTXT2", userInfo.get("JJTXT2"));
			session.setAttribute("LOGIN_USER_JJTXT3", userInfo.get("JJTXT3"));
			session.setAttribute("LOGIN_USER_JJTXT4", userInfo.get("JJTXT4"));
			session.setAttribute("LOGIN_USER_JJTXT5", userInfo.get("JJTXT5"));
			String BONSA_YN = (String)userInfo.get("BONSA_GUBUN");
			String LOGIN_USER_JIKJE = "";
			if (!StringUtil.isNull((String) userInfo.get("JIKJE1"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE1");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE2"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE2");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE3"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE3");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE4"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE4");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE5"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE5");
			
			session.setAttribute("LOGIN_USER_JIKJE", LOGIN_USER_JIKJE);
			session.setAttribute("LOGIN_USER_CEL_TEL", userInfo.get("CEL_TEL"));
			session.setAttribute("LOGIN_USER_AUTH", userInfo.get("AUTH_CD"));
			
			// 권한을 가져온다.
			paramMap.put("USER_ID", userInfo.get("USER_ID"));
			Map<String, String> gradeDetail = pelsFormService.getDetail("GradeDetail", paramMap);
			if(gradeDetail != null) {
				session.setAttribute("GRADE",  gradeDetail.get("ATTY_CFY"));
			}
			else {
				session.setAttribute("GRADE", "");
			}

			session.setMaxInactiveInterval(60*60*100);
			
			String sIP = request.getRemoteAddr();
			HashMap<String, Object> map = new HashMap<String, Object>();
			map.put("PPCD", userInfo.get("PLANT"));
			map.put("TYPE_CD", "LOGIN");
			map.put("RG_SCCD", LOGIN_USER_JIKJE);
			map.put("HOLD_SCCD", userInfo.get("DEPT_CD"));
			map.put("DOC_UNQ_ID", "");
			map.put("SYS_ACSS_CFY_CD", "WEB");
			map.put("RMK", "");
			map.put("REGPR_IP_ADDR", sIP);
			map.put("REGPR_ID", userInfo.get("USER_ID"));
			map.put("REGPR_NM", userInfo.get("USER_NAME"));

			pelsFormService.insert("SetUsecase", map);			
			
			mav.setViewName("redirect:/index.do");
		} else {
			mav.addObject("result", "login fail.");
			mav.setViewName("/pels/result");
		}
		
		return mav;
	}
		
}
