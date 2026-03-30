package com.khnp.pels.exam.controller;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Clob;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.exam.service.PELSExamService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSExamMobileController {

	private static final Logger log = LoggerFactory.getLogger(PELSExamMobileController.class);
	
	@Autowired
	private PELSExamService pelsExamService;
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	@Resource(name = "utilProperties")
	private Properties utilProperties;	

	/*
	 * Exam_Search_M.do
	 * 점검조회
	 * 
	 */
	@RequestMapping(value= {"/Exam_Search_M.do"}, method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
	@ResponseBody
	public List<Map<String, Object>> Exam_Search_M (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); 
		
		paramMap.put("CHCK_STRT_DT", "");
		paramMap.put("CHCK_END_DT", "");
		
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		paramMap.put("CHCK_TITL", "");
		paramMap.put("PRSTS_CFY", "");
		paramMap.put("SH_SORT", "CHCK_STRT_DT");
		
		int DISPSTART = 0, DISPEND = 100;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		// 진행상태구분 R:준비, A:허가 F:수행, S:불만족, C:완료, X:불만족완료
		paramMap.put("PRSTS_CFY", "");
		paramMap.put("CHKPR_ID", USER_ID);
		
		List<Map<String, Object>> examList = (ArrayList) pelsExamService.getList("ExamList", paramMap);
		
		return examList;
	}
	
	@RequestMapping(value= {"/Exam_Detail_M.do"}, method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
	@ResponseBody
	public Map<String, Object> Exam_Detail_M (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMapReturn = new HashMap<String, Object>();

		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String PELS_IP_URL = utilProperties.getProperty("PELS_IP_URL");
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), ""); 
		
		paramMap.put("CHCK_SNO", CHCK_SNO);
		Map<String, String> examDetail = pelsExamService.getDetail("ExamDetail", paramMap);
		paramMapReturn.put("PRCDOC_NO", examDetail.get("PRCDOC_NO"));
		paramMapReturn.put("PRCDOC_NM", examDetail.get("PRCDOC_NM"));
		paramMapReturn.put("DOC_TYP_CD", examDetail.get("DOC_TYP_CD"));
		paramMapReturn.put("PRT_NO", examDetail.get("PRT_NO"));
		paramMapReturn.put("FM_CHCK_STRT_DT", examDetail.get("FM_CHCK_STRT_DT"));
		paramMapReturn.put("FM_CHCK_END_DT", examDetail.get("FM_CHCK_END_DT"));
		paramMapReturn.put("CHCK_TITL", examDetail.get("CHCK_TITL"));
		paramMapReturn.put("CHKPR_ID", examDetail.get("CHKPR_ID"));
		paramMapReturn.put("CHKPR_FNM", examDetail.get("CHKPR_FNM"));
		paramMapReturn.put("PRSTS_CFY", examDetail.get("PRSTS_CFY"));
		paramMapReturn.put("PRSTS_CFY_NM", examDetail.get("PRSTS_CFY_NM"));
		
		paramMap.put("CHCK_SNO", CHCK_SNO);
		paramMap.put("ATFL_NO", "1");
		Map<String, String> examJsonDetail = pelsExamService.getDetail("ExamJsonDetail", paramMap);
		
		
		paramMapReturn.put("PDF_PATH", PELS_IP_URL + "/" + examJsonDetail.get("ATFL_PHCL_NM"));
		Object clobObj = examJsonDetail.get("WRTE_JSON_DCR");
		String json = "";
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMapReturn.put("FRM_OVER_JSON", json);
		
		clobObj = examJsonDetail.get("CMP_JSON_DCR");
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMapReturn.put("FRM_CONS_JSON", json);
		
		return paramMapReturn;
	}
	
	public static String clobToString(Clob clob) throws Exception {
	    if (clob == null) return null;

	    StringBuilder sb = new StringBuilder();
	    try (Reader reader = clob.getCharacterStream();
	         BufferedReader br = new BufferedReader(reader)) {

	        char[] buffer = new char[8192]; // 8KB
	        int length;
	        while ((length = br.read(buffer)) != -1) {
	            sb.append(buffer, 0, length);
	        }
	    }
	    
	    return sb.toString();
	}
	
	
	/**
	 * 시험상태 저장
	 * @param request
	 * @return
	 * @throws ServletException 
	 */
	@RequestMapping(value={"/Exam_CFY_Update_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Exam_CFY_Update (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String CHCK_SNO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHCK_SNO"), ""));
		String PRSTS_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRSTS_CFY"), ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			HashMap<String, Object> map = new HashMap<String, Object>();
			map.put("CHCK_SNO", CHCK_SNO);
			map.put("PRSTS_CFY", PRSTS_CFY);
	
			pelsExamService.update("UpdateCheck_CFY", map);
			
			resultMsg = "저장에 성공하였습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "Exam_CFY_Update");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	
	@RequestMapping(value={"/Exam_JsonSave_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formJsonSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		String resultMsg = "저장 되었습니다.";
		String resultCd = "false";
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");
		String ATFL_NO = StringUtil.nvl(request.getParameter("ATFL_NO"), "1");
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), "");
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), "");
		String FRM_OVER_JSON = StringUtil.nvl(request.getParameter("FRM_OVER_JSON"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap.clear();
			paramMap.put("CHCK_SNO", CHCK_SNO);
			paramMap.put("ATFL_NO", "1");
			paramMap.put("REGPR_ID", USER_ID);
			paramMap.put("REGPR_NM", USER_NM);
			paramMap.put("WRTE_JSON_DCR", FRM_OVER_JSON);
				
			pelsExamService.update("UpdateExamJson", paramMap);
			
			resultCd = "true";
		} 
		catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "Exam_JsonSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}	
	
	@RequestMapping(value = "/proxy/pdf", method = RequestMethod.GET)
	public void proxyPdf(@RequestParam("path") String path, HttpServletResponse response) throws Exception {

		URL url = new URL(path);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.setConnectTimeout(15000);
		conn.setReadTimeout(15000);

		response.setContentType("application/pdf");
		response.setHeader("Content-Disposition", "inline; filename=form.pdf");

		try (InputStream is = conn.getInputStream(); OutputStream os = response.getOutputStream()) {
			byte[] buffer = new byte[8192];
			int len;
			while ((len = is.read(buffer)) != -1) {
				os.write(buffer, 0, len);
			}
			os.flush();
		}
	}	
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_Input_M.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_Input_M (HttpServletRequest request) {
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		ModelAndView mav = new ModelAndView();
		
		String SH_DOC_TYP_CD = StringUtil.nvl(request.getParameter("SH_DOC_TYP_CD"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRT_NO = StringUtil.nvl(request.getParameter("SH_PRT_NO"), "");
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); 
		
		System.out.println("USER_ID = " + USER_ID);
	    
		paramMap.put("USER_ID", USER_ID);
		Map<String, Object> userInfo = pelsExamService.getDetail("GetUserInfo", paramMap);
		if (userInfo != null) {
			HttpSession session = request.getSession();
			session.setAttribute("LOGIN_USER_ID", userInfo.get("USER_ID"));
			session.setAttribute("LOGIN_USER_NM", userInfo.get("USER_NAME"));
			session.setAttribute("LOGIN_USER_DEPT_CD", userInfo.get("DEPT_CD"));
			session.setAttribute("LOGIN_USER_DEPT_NM", userInfo.get("DEPT_NM"));
			session.setAttribute("LOGIN_USER_JIKWI", userInfo.get("JIKWI"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE", userInfo.get("TYPE_CD"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE_NM", userInfo.get("TYPE_DESC"));
			session.setAttribute("LOGIN_USER_PLANT_CD", userInfo.get("PLANT"));
			session.setAttribute("LOGIN_USER_PLANT_NM", userInfo.get("PLANT_DESC"));
			session.setAttribute("LOGIN_USER_UNIT_TYPE", userInfo.get("UNIT_TYPE"));
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
			
			session.setMaxInactiveInterval(60*60*100);
		}
		else {
			System.out.println("사번이 없습니다..........");
		}
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String CHKPR_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String CHKPR_FNM = (String) session.getAttribute("LOGIN_USER_NM");
		
		paramMap.put("LAST_UPDR_ID", CHKPR_ID);
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		
		ArrayList PrcdocList = (ArrayList) pelsExamService.getList("ProcedureList", paramMap);
		mav.addObject("PrcdocList", PrcdocList);
		

		if("".equals(SH_DOC_TYP_CD))
			SH_DOC_TYP_CD = "FP0";
		
		mav.addObject("SH_DOC_TYP_CD", SH_DOC_TYP_CD);
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);
		mav.addObject("SH_PRT_NO", SH_PRT_NO);
		mav.addObject("USER_ID", USER_ID);
		
		mav.setViewName("/pels/exam/Exam_Input_M");
		
		return mav;
	}
}
