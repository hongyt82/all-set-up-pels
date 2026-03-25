package com.khnp.pels.form.controller;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Clob;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;
import com.khnp.pels.system.service.PELSProcedureService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

/**
 * 절차서(서식)관리 > 정주기시험
 * @author dev004
 *
 */
@Controller
public class PELSFormController {

	private static final Logger log = LoggerFactory.getLogger(PELSFormController.class);
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	
	@Autowired
	private PELSFormService pelsFormService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	private String URL = "http://218.157.239.4:19090/";
	
	/**
	 * 절차서(서식)관리 > 정주기시험
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// todo: 유저 세션, 조회조건 초기세팅, ...
		
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), ""); // 절차서번호
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), ""); // 절차서명
		
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		paramMap.put("PRCDOC_CFY", PrcdocCfy.MAIN.getCode()); // 절차서구분(정주기시험(P))
		
		int TCNT = pelsFormService.getCount("FormCount", paramMap); // 총 조회수
		ArrayList formList = (ArrayList) pelsFormService.getList("FormList", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("formList", formList);
		
		// 검색조건 재입력
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		
		mav.setViewName("/pels/form/Form_Search");
		return mav;
	}	
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		mav.addObject("REGPR_NM", USER_NM);
		
		mav.setViewName("/pels/form/Form_Input");
		return mav;
	}

	/**
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		
		// 정주기시험 일정(GE_PL_SCHE_S) 조회
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
		
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL); // 서식고유키값
		mav.addObject("REGPR_NM", USER_NM); // 등록자명
		
		if(formDetail != null) {
			mav.addObject("PRCDOC_UNQ_KY_VAL", formDetail.get("PRCDOC_UNQ_KY_VAL")); // 절차서고유번호
			mav.addObject("PRCDOC_NO", formDetail.get("PRCDOC_NO")); // 절차서번호
			mav.addObject("PRCDOC_NM", formDetail.get("PRCDOC_NM")); // 절차서명
			mav.addObject("DOC_TYP", formDetail.get("DOC_TYP")); // 문서유형
			mav.addObject("RRD_CFY", formDetail.get("RRD_CFY")); // 주기
			
			//mav.addObject("PRCDOC_CFY", formDetail.get("PRCDOC_CFY")); // 절차서구분
			mav.addObject("PRCDOC_RVSN_NO", formDetail.get("PRCDOC_RVSN_NO")); // 절차서개정번호
			// mav.addObject("ATCT_NM", formDetail.get("ATCT_NM")); // 절차서개정번호
			
			mav.addObject("ATFL_TITL_NM1", formDetail.get("ATFL_TITL_NM1")); // 서식1 제목
			mav.addObject("ATFL_TITL_NM2", formDetail.get("ATFL_TITL_NM2")); // 서식2 제목
			mav.addObject("ATFL_TITL_NM3", formDetail.get("ATFL_TITL_NM3")); // 서식3 제목
			mav.addObject("ATFL_TITL_NM4", formDetail.get("ATFL_TITL_NM4")); // 서식4 제목
			mav.addObject("ATFL_TITL_NM5", formDetail.get("ATFL_TITL_NM5")); // 서식5 제목
			
			mav.addObject("ATFL_PHCL_NM1", formDetail.get("ATFL_PHCL_NM1")); // 서식1 파일경로
			mav.addObject("ATFL_PHCL_NM2", formDetail.get("ATFL_PHCL_NM2")); // 서식2 파일경로
			mav.addObject("ATFL_PHCL_NM3", formDetail.get("ATFL_PHCL_NM3")); // 서식3 파일경로
			mav.addObject("ATFL_PHCL_NM4", formDetail.get("ATFL_PHCL_NM4")); // 서식4 파일경로
			mav.addObject("ATFL_PHCL_NM5", formDetail.get("ATFL_PHCL_NM5")); // 서식5 파일경로
		}
		
		mav.setViewName("/pels/form/Form_Detail");
		return mav;
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
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Update.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Form_Update (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), "");
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String CFY = StringUtil.nvl(request.getParameter("CFY"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", "");
		ArrayList formList = (ArrayList) pelsFormService.getList("FormUpdateList", paramMap);
		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY); // 고유키값
		mav.addObject("formList", formList);
		if(formList.size() > 0 && "".equals(CFY)) {
			Map<String, String> MapTemp = (Map<String, String>)formList.get(0);
			
			Object clobObj = MapTemp.get("FRM_OVER_JSON");
			
			String json = "";
			try {
				json = clobToString((Clob) clobObj);
			}
			catch(Exception e) {}
			
			mav.addObject("FRM_OVER_JSON", json);
			

			
			mav.setViewName("/pels/system/Form_Update");
		}
		else {
			paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
			Map<String, String> scheduleDetail = pelsFormService.getDetail("ProcedureDetail", paramMap);
			
			mav.addObject("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL); // 고유키값
			mav.addObject("REGPR_NM", USER_NM);
			
			if(scheduleDetail != null) {
				mav.addObject("PRCDOC_NO", scheduleDetail.get("PRCDOC_NO"));     // 절차서번호
				mav.addObject("PRCDOC_NM", scheduleDetail.get("PRCDOC_NM"));     // 절차서명
				mav.addObject("DOC_TYP", scheduleDetail.get("DOC_PART_NO")); 	 // 문서유형
				mav.addObject("DOC_PART_NO", scheduleDetail.get("DOC_PART_NO")); // 문서부분번호
				mav.addObject("RRD_CFY", scheduleDetail.get("RRD_CFY")); 		 // 주기
				mav.addObject("MNTRG_YN", scheduleDetail.get("MNTRG_YN")); 		 // 모니터링 유무
			}
			
			mav.setViewName("/pels/system/Form_Input");
		}
		
		return mav;
	}
	
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/KhnpEditor.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Form_Json_Detail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		System.out.println("========================================================================");
		System.out.println("USER_ID : " + USER_ID);
		System.out.println("========================================================================");
		
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
			
		mav.setViewName("/pels/popup/KhnpEditor");
		
		return mav;
	}	
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Json_M.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Form_Json_M (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		System.out.println("========================================================================");
		System.out.println("USER_ID : " + USER_ID);
		System.out.println("========================================================================");
		
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		Map<String, String> MapTemp =  pelsFormService.getDetail("FormDetail", paramMap);
		
		HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
		paramMap2.put("USER_ID",  USER_ID);
		paramMap2.put("USER_NM",  USER_NM);
		paramMap2.put("PPCD",  MapTemp.get("PPCD"));
		paramMap2.put("PRCDOC_NO",  MapTemp.get("PRCDOC_NO"));
		paramMap2.put("PRCDOC_NM",  MapTemp.get("PRCDOC_NM"));
		paramMap2.put("PRCDOC_RVSN_NO",  MapTemp.get("PRCDOC_RVSN_NO"));
		paramMap2.put("ATCT_NM",  MapTemp.get("ATCT_NM"));
		paramMap2.put("ATCT_CFY",  MapTemp.get("ATCT_CFY"));		
		paramMap2.put("PDF_PATH", URL + "upload/" + MapTemp.get("ATFL_PHCL_NM1"));
		
		Object clobObj = MapTemp.get("FRM_OVER_JSON");
		String json = "";
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMap2.put("FRM_OVER_JSON", json);
		
		clobObj = MapTemp.get("FRM_CONS_JSON");
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMap2.put("FRM_CONS_JSON", json);
		
		JSONObject JSONDATA = new JSONObject(paramMap2);
		mav.addObject("JSONDATA", JSONDATA);
		mav.setViewName("/pels/Json");
		
		return mav;
	}
	
	/* 추가시작 */
	@RequestMapping(value = "/api/Form_Json_M", method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
	@ResponseBody
	public Map<String, Object> Form_Json_M_API(HttpServletRequest request) throws Exception {

		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");

		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");

		HashMap<String, Object> paramMap = new HashMap<>();
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);

		Map<String, String> mapTemp = pelsFormService.getDetail("FormDetail", paramMap);

		Map<String, Object> result = new HashMap<>();
		result.put("USER_ID", USER_ID);
		result.put("USER_NM", USER_NM);

		// PDF 경로
		result.put("PDF_PATH", URL + "upload/" + mapTemp.get("ATFL_PHCL_NM1"));

		// Overlay JSON
		Object overClob = mapTemp.get("FRM_OVER_JSON");
		if (overClob instanceof Clob) {
			result.put("FRM_OVER_JSON", clobToString((Clob) overClob));
		} else {
			result.put("FRM_OVER_JSON", null);
		}

		// Constraint JSON
		Object consClob = mapTemp.get("FRM_CONS_JSON");
		if (consClob instanceof Clob) {
			result.put("FRM_CONS_JSON", clobToString((Clob) consClob));
		} else {
			result.put("FRM_CONS_JSON", null);
		}

		return result;
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
	

	/* 추가끝 */
	    
	/**
	 * 절차서(서식)을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	/*
	@RequestMapping(value={"/Form_Insert_Ajax.do", "/Form_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식폼고유키값
		
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), ""); // 절차서고유키값
		String PRCDOC_CFY = PrcdocCfy.MAIN.getCode(); // 절차서구분(정주기시험(P))
		String PRCDOC_RVSN_NO = StringUtil.nvl(request.getParameter("PRCDOC_RVSN_NO"), ""); 		// 절차서개정번호
		
		String ATFL_TITL_NM1 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM1"), ""); // 서식1 제목
		String ATFL_TITL_NM2 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM2"), ""); // 서식2 제목
		String ATFL_TITL_NM3 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM3"), ""); // 서식3 제목
		String ATFL_TITL_NM4 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM4"), ""); // 서식4 제목
		String ATFL_TITL_NM5 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM5"), ""); // 서식5 제목
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRCDOC_RVSN_NO", PRCDOC_RVSN_NO); // 절차서개정번호
		paramMap.put("ATCT_NM", ""); // 붙임명
		
		paramMap.put("ATFL_TITL_NM1", ATFL_TITL_NM1);
		paramMap.put("ATFL_TITL_NM2", ATFL_TITL_NM2);
		paramMap.put("ATFL_TITL_NM3", ATFL_TITL_NM3);
		paramMap.put("ATFL_TITL_NM4", ATFL_TITL_NM4);
		paramMap.put("ATFL_TITL_NM5", ATFL_TITL_NM5);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		// 그룹명
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.FRM_M);
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";
		
		if ("/Form_Insert_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "INSERT");
		}
		else if ("/Form_Update_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "UPDATE");
		}
		
		try {
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "정주기시험 서식 저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	*/	
	
	/**
	 * 절차서(서식)을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Form_Insert_Ajax.do", "/Form_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		System.out.println("Form_Insert_Ajax or Form_Update_Ajax");
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식폼고유키값
		
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), ""); 	// 절차서고유키값
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), ""); 				// 정주기(P), 점검지(M) 구분
		String PRCDOC_RVSN_NO = StringUtil.nvl(request.getParameter("PRCDOC_RVSN_NO"), ""); 		// 절차서개정번호
		
		String ATFL_TITL_NM1 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM1"), ""); // 서식1 제목
		String ATFL_TITL_NM2 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM2"), ""); // 서식2 제목
		String ATFL_TITL_NM3 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM3"), ""); // 서식3 제목
		String ATFL_TITL_NM4 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM4"), ""); // 서식4 제목
		String ATFL_TITL_NM5 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM5"), ""); // 서식5 제목
		
		String FRM_OVER_JSON = StringUtil.nvl(request.getParameter("FRM_OVER_JSON"), ""); // 서식5 제목
		String FRM_CONS_JSON = StringUtil.nvl(request.getParameter("FRM_CONS_JSON"), ""); // 서식5 제목
		System.out.println("=====================================================");
		System.out.println(FRM_OVER_JSON);
		System.out.println("=====================================================");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRCDOC_RVSN_NO", PRCDOC_RVSN_NO); // 절차서개정번호
		paramMap.put("ATCT_NM", ""); 	// 붙임명
		paramMap.put("ATCT_CFY", ""); 	// 붙임구분
		
		paramMap.put("ATFL_TITL_NM1", ATFL_TITL_NM1);
		paramMap.put("ATFL_TITL_NM2", ATFL_TITL_NM2);
		paramMap.put("ATFL_TITL_NM3", ATFL_TITL_NM3);
		paramMap.put("ATFL_TITL_NM4", ATFL_TITL_NM4);
		paramMap.put("ATFL_TITL_NM5", ATFL_TITL_NM5);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		// 그룹명
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.FRM_M);
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";
		
		if ("/Form_Insert_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "INSERT");
		}
		else if ("/Form_Update_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "UPDATE");
		}
		
		try {
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			if ("/Form_Insert_Ajax.do".equals(uri)) {
				paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
				List<Map> formList = pelsFormService.getList("FormUpdateList", paramMap);
				paramMap.put("PRCDOC_UNQ_KY_VAL", formList.get(0).get("PRCDOC_UNQ_KY_VAL"));
				paramMap.put("PRCDOC_RVSN_NO", formList.get(0).get("PRCDOC_RVSN_NO"));
				paramMap.put("FRM_UNQ_KY_VAL", formList.get(0).get("FRM_UNQ_KY_VAL"));
				
				
			}
			else if ("/Form_Update_Ajax.do".equals(uri)) {
				paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
				paramMap.put("PRCDOC_RVSN_NO", PRCDOC_RVSN_NO);
				paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				
				paramMap.put("FRM_OVER_JSON", FRM_OVER_JSON);
				paramMap.put("FRM_CONS_JSON", FRM_CONS_JSON);
				
				System.out.println("FRM_OVER_JSON=" + FRM_OVER_JSON);
				
				if(FRM_OVER_JSON != null || FRM_CONS_JSON != null)
				{
					// 임시로 만듬 테스트용
					pelsProcedureService.delete("DeleteFrmJson", paramMap);
					pelsProcedureService.insert("InsertFrmJson", paramMap);
				}
			}

			pelsProcedureService.update("UpdateProcedureVer", paramMap);
			
			resultCd = "true";
			
			
		} catch(Exception e) {
			resultMsg = "정주기시험 서식 저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 절차서(서식)을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/FormJsonSave_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formJsonSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		String resultMsg = "저장 되었습니다.";
		String resultCd = "false";
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String FRM_OVER_JSON = StringUtil.nvl(request.getParameter("FRM_OVER_JSON"), "");
		String FRM_CONS_JSON = StringUtil.nvl(request.getParameter("FRM_CONS_JSON"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap.clear();
			paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
			paramMap.put("FRM_OVER_JSON", FRM_OVER_JSON);
			paramMap.put("FRM_CONS_JSON", FRM_CONS_JSON);
				
			pelsProcedureService.delete("DeleteFrmJson", paramMap);
			pelsProcedureService.insert("InsertFrmJson", paramMap);
			
			resultCd = "true";
		} 
		catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "FormJsonSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	
	/**
	 * 선택된 절차서(서식)을 삭제한다.
	 * @param request
	 * @param attributes
	 * @return
	 */
	@RequestMapping(value="/Form_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formDelete (HttpServletRequest request) {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		
		// 그룹명
		map.put("ATFL_GRUP_NM", AtflGrupNm.FRM_M);
		
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultMsg =  pelsFormLogicService.formDelete(map);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "정주기시험 서식 삭제에 실패하였습니다.";
			log.error("formDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		
		return resultMap;
	}
	
	/**
	 * 선택된 절차서(서식) 첨부파일을 삭제한다.
	 * @param request
	 * @param attributes
	 * @return
	 */
	@RequestMapping(value="/Form_File_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formFileDelete (HttpServletRequest request) {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식폼고유키값
		String ATFL_ID = StringUtil.nvl(request.getParameter("ATFL_ID"), ""); // 첨부파일 ID
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("UNQ_NO", FRM_UNQ_KY_VAL);
		map.put("ATFL_ID", ATFL_ID);
		
		// 그룹명
		map.put("ATFL_GRUP_NM", AtflGrupNm.FRM_M);
		
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultMsg =  pelsFormLogicService.formFileDelete(map);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "파일 삭제에 실패하였습니다.";
			log.error("formFileDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		
		return resultMap;
	}
	
	
	
	/**
	 * 절차서(서식) 팝업
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Popup.do", "/Form_Popup_M.do" }, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formPopupSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "10"));		
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		paramMap.put("PRCDOC_NO", ""); 				// 절차서번호
		paramMap.put("PRCDOC_NM", ""); 				// 절차서명
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY); 	// 절차서구분(정주기시험(P))
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsFormService.getCount("FormCount", paramMap); // 총 조회수
		int TOTALPAGE = 0;
		if(Math.floorMod(TCNT, LISTCNT) > 0) {
			TOTALPAGE = (TCNT/LISTCNT) + 1;
		} else {
			TOTALPAGE = (TCNT/LISTCNT);
		}

		if((PAGE / LISTCNT) > 0) {
			if(Math.floorMod(PAGE, LISTCNT) > 0) {
				STARTPAGE = (((PAGE / LISTCNT)) * 20) + 1;
			} else {
				STARTPAGE = (((PAGE / LISTCNT) - 1) * 20) + 1;
			}
		} else {
			STARTPAGE = ((PAGE / LISTCNT) * 20) + 1;
		}
		
		ENDPAGE = STARTPAGE + 19;
		if (ENDPAGE > TOTALPAGE) {
			ENDPAGE = TOTALPAGE;
		}
		
		
		if ("/Form_Popup_M.do".equals(request.getRequestURI())) {
			paramMap.put("DISPSTART", 1);
			paramMap.put("DISPEND", 200);
			ArrayList formList = (ArrayList) pelsFormService.getList("FormList", paramMap);
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("formList", formList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			ArrayList formList = (ArrayList) pelsFormService.getList("FormList", paramMap);
			mav.addObject("formList", formList);
			mav.addObject("jsonArray", new JSONArray(formList).toString());
			
			mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
			
			mav.addObject("TCNT", TCNT);
			mav.addObject("PAGE", PAGE);
			mav.addObject("TOTALPAGE", TOTALPAGE);
			mav.addObject("STARTPAGE", STARTPAGE);
			mav.addObject("ENDPAGE", ENDPAGE);
			mav.addObject("LISTCNT", LISTCNT);
	
			mav.setViewName("/pels/popup/Form_Popup");
		}
		return mav;
	}
	
	/**
	 * 절차서(서식) 팝업
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Draw.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Form_Draw (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "1");
		String FRM_ID = StringUtil.nvl(request.getParameter("FRM_ID"), "024030601_doc_1");

		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("FRM_ID", FRM_ID);
		paramMap.put("DOC_UNQ_ID", "");
		paramMap.put("DISPSTART", 1);
		paramMap.put("DISPEND", 100);
		
		ArrayList FormDrawList = (ArrayList) pelsFormService.getList("MobileFormDrawList", paramMap);
		
		mav.addObject("FormDrawList", FormDrawList);
		mav.addObject("jsonArray", new JSONArray(FormDrawList).toString());
		
		mav.setViewName("/pels/form/Form_Draw");
		
		return mav;
	}	
	
	
    @RequestMapping(value= {"/e-link-v2/**"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String forward (HttpServletRequest request) {
        return "forward:/static/e-link-v2/index.html";
    }
}
