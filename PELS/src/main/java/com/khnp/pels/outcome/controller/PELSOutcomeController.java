package com.khnp.pels.outcome.controller;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.dto.CommonFileDTO;
import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.FrmCfy;
import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.common.enums.PrstsCfy;
import com.khnp.pels.common.service.PELSFileService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;
import com.khnp.pels.outcome.service.PELSOutcomeService;

import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;

import com.google.gson.JsonObject;
import common.util.StringUtil;
import common.xss.JsonXssFilter;
import common.util.ExcelUtil;
import common.util.HttpConnectionUtil;
import common.util.PELS_FileUtil;

/**
 * 결과관리 > 정주기시험
 * 결과관리 > 점검관리(붙임)
 * 결과관리 > 일반양식
 * @author dev004
 *
 */
@Controller
public class PELSOutcomeController {
	private static final Logger log = LoggerFactory.getLogger(PELSOutcomeController.class);
	
	@Autowired
	private PELSFileService pelsFileService;	
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	@Autowired
	private PELSOutcomeService pelsOutcomeService;
	
	@Resource(name = "utilProperties")
	private Properties utilProperties;	
	
	private final SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmssSSS", java.util.Locale.KOREA);
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 결과관리 > 정주기시험
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView outcomeSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		// 시험시작, 종료일자 초기세팅
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.plusYears(-1);
		LocalDate endDate = nowDate.plusDays(15);
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));		
		
		String SH_FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("SH_FRM_UNQ_KY_VAL"), ""); 
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String SH_SORT = StringUtil.nvl(request.getParameter("SH_SORT"), "CHCK_STRT_DT");
		
		String CHCK_STRT_DT = StringUtil.nvl(request.getParameter("CHCK_STRT_DT"), startDate.format(formatter)); // 시험시작일자
		String CHCK_END_DT  = StringUtil.nvl(request.getParameter("CHCK_END_DT"), endDate.format(formatter));    // 시험종료일자
		
		paramMap.put("FRM_UNQ_KY_VAL", SH_FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("PRCDOC_NM", SH_PRCDOC_NM);
		paramMap.put("TITL_NM", SH_TITL_NM);
		paramMap.put("SH_SORT", SH_SORT);
		
		paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT.replaceAll("-", ""));
		paramMap.put("CHCK_END_DT", CHCK_END_DT.replaceAll("-", ""));
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRSTS_CFY", PRSTS_CFY); 			// 진행상태구분 R:준비, F:수행, S:정지, C:완료
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("ExamCount", paramMap);
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
		
		ArrayList outcomeList = (ArrayList) pelsOutcomeService.getList("ExamList", paramMap);
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);		
		mav.addObject("outcomeList", outcomeList);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsOutcomeService.getList("GetPlantCode", paramMap);
		mav.addObject("plantList", plantList);
		
		paramMap.clear();
		paramMap.put("PRCDOC_CFY", "M");
		paramMap.put("PRCDOC_NO", ""); 				// 절차서번호
		paramMap.put("PRCDOC_NM", ""); 				// 절차서명
		paramMap.put("DISPSTART", 1);
		paramMap.put("DISPEND", 200);
		ArrayList formList = (ArrayList) pelsFormService.getList("FormList", paramMap);
		mav.addObject("formList", formList);
		
		System.out.println("PRSTS_CFY = " + PRSTS_CFY);
		
		// 검색조건 재입력
		mav.addObject("SH_FRM_UNQ_KY_VAL", SH_FRM_UNQ_KY_VAL);		
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);		
		mav.addObject("SH_PRCDOC_NM", SH_PRCDOC_NM);		
		mav.addObject("SH_TITL_NM", SH_TITL_NM);		
		mav.addObject("SH_SORT", SH_SORT);		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);		
		mav.addObject("PRSTS_CFY", PRSTS_CFY);		
		mav.addObject("CHCK_STRT_DT", CHCK_STRT_DT);
		mav.addObject("CHCK_END_DT", CHCK_END_DT);
		
		mav.setViewName("/pels/outcome/Outcome_Search_" + PRCDOC_CFY);
		return mav;
	}
	
	
	/**
	 * 결과관리 > 점검관리(붙임)
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Atct_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView outcomeAtctSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		// 시험시작, 종료일자 초기세팅
		//LocalDate nowDate = LocalDate.now();
		//LocalDate startDate = nowDate.withDayOfMonth(1);
		//LocalDate endDate = nowDate.withDayOfMonth(nowDate.lengthOfMonth());
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.plusDays(-30);
		LocalDate endDate = nowDate;		
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));		

		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), ""); // 절차서번호
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), ""); // 절차서명
		
		String CHCK_STRT_DT = StringUtil.nvl(request.getParameter("CHCK_STRT_DT"), startDate.format(formatter)); // 시험시작일자
		String CHCK_END_DT  = StringUtil.nvl(request.getParameter("CHCK_END_DT"), endDate.format(formatter));    // 시험종료일자
		
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		
		paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT.replaceAll("-", ""));
		paramMap.put("CHCK_END_DT", CHCK_END_DT.replaceAll("-", ""));
		paramMap.put("PRCDOC_CFY", PrcdocCfy.ATCT.getCode()); // 절차서구분
		
		paramMap.put("PRSTS_CFY", PrstsCfy.COMPLETE.getCode()); // 진행상태구분 R:준비, F:수행, S:정지, C:완료
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("ExamCount", paramMap); // 총 조회수
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
		
		
		ArrayList outcomeList = (ArrayList) pelsOutcomeService.getList("ExamList", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);		
		mav.addObject("outcomeList", outcomeList);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsOutcomeService.getList("GetPlantCode", paramMap);
		mav.addObject("plantList", plantList);
		
		// 검색조건 재입력
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		
		mav.addObject("CHCK_STRT_DT", CHCK_STRT_DT);
		mav.addObject("CHCK_END_DT", CHCK_END_DT);
		
		mav.setViewName("/pels/outcome/Outcome_Atct_Search");
		return mav;
	}
	
	/**
	 * 결과관리 > 일반양식
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Etc_Outcome_Search.do", "/Etc_Outcome_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView etcOutcomeSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), ""); 	// 제목
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), ""); 	// 제목
		
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("REGPR_NM", "");
		paramMap.put("FRM_CFY", FRM_CFY);
		
		int TCNT = pelsOutcomeService.getCount("EtcHistoryFormCount", paramMap); // 총 조회수
		ArrayList etcOutcomeList = (ArrayList) pelsOutcomeService.getList("EtcHistoryFormList", paramMap);
		if ("/Etc_Outcome_Search_M.do".equals(request.getRequestURI())) {
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("etcOutcomeList", etcOutcomeList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			mav.addObject("TCNT", TCNT);
			mav.addObject("etcOutcomeList", etcOutcomeList);
			
			// 검색조건 재입력
			mav.addObject("FRM_NM", FRM_NM);
			
			mav.setViewName("/pels/outcome/Etc_Outcome_Search");
		}
		return mav;
	}
	
	/**
	 * 결과관리 > 작업전회의 현황
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Job_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Outcome_Job_Search (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		HttpSession session = request.getSession();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));		

		// PLANT_TYPE=${LOGIN_USER_PLANT_TYPE}&USER_ID=${LOGIN_USER_ID}&USER_NM=${LOGIN_USER_NM}&PLANT=${LOGIN_USER_PLANT_CD}&DEPT_NM=${LOGIN_USER_DEPT_NM}
		
		String PLANT_TYPE = StringUtil.nvl(request.getParameter("PLANT_TYPE"), ""); 
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); 
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), ""); 
		String PLANT = StringUtil.nvl(request.getParameter("PLANT"), ""); 
		String DEPT_NM = StringUtil.nvl(request.getParameter("DEPT_NM"), "");
		if(!"".equals(PLANT_TYPE)) {
			session.setAttribute("LOGIN_USER_ID", USER_ID);
			session.setAttribute("LOGIN_USER_NM", USER_NM);
			session.setAttribute("LOGIN_DIVS_CD", PLANT.substring(0,3));
			session.setAttribute("LOGIN_PPCD", PLANT);
			session.setAttribute("LOGIN_PWPL_CFY", PLANT_TYPE);
			session.setAttribute("LOGIN_PPCD_NM", "");
			session.setAttribute("LOGIN_TYPE_CD", PLANT_TYPE);
			session.setAttribute("LOGIN_DEPT_NM", DEPT_NM);
		}
		
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.minusDays(30);
		LocalDate endDate = nowDate;
		
		String LOGIN_PWPL_CFY = (String) session.getAttribute("LOGIN_PWPL_CFY");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String LOGIN_USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String LOGIN_DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		LOGIN_PWPL_CFY = StringUtil.nvl(request.getParameter("LOGIN_PWPL_CFY"), LOGIN_PWPL_CFY); 
		LOGIN_PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), LOGIN_PPCD); 
		LOGIN_USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), LOGIN_USER_ID); 
		LOGIN_USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), LOGIN_USER_NM); 
		LOGIN_DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), LOGIN_DIVS_CD);		
		
		//if("".equals(LOGIN_PPCD) || LOGIN_PPCD == null) {
		//	LOGIN_PPCD = "3330";
		//	LOGIN_PWPL_CFY = "2";
		//}
		if("0".equals(LOGIN_PWPL_CFY)) {
			LOGIN_PPCD = "";
		}
		
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), LOGIN_PPCD); 
		String PWPL_CFY = StringUtil.nvl(request.getParameter("PWPL_CFY"), LOGIN_PWPL_CFY); 
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), ""); // 제목
		String WRK_NM = StringUtil.nvl(request.getParameter("WRK_NM"), ""); // 제목
		String MTNG_DY_S = StringUtil.nvl(request.getParameter("MTNG_DY_S"), startDate.format(formatter)); 	// 시작일자
		String MTNG_DY_E = StringUtil.nvl(request.getParameter("MTNG_DY_E"), endDate.format(formatter)); // 종료일자
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("WRK_NM", WRK_NM);
		paramMap.put("REGPR_NM", "");
		paramMap.put("FRM_CFY", "");
		
		if( PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", PPCD);
		paramMap.put("PWPL_CFY", PWPL_CFY);
		paramMap.put("MTNG_DY_S", MTNG_DY_S.replaceAll("-", ""));
		paramMap.put("MTNG_DY_E", MTNG_DY_E.replaceAll("-", ""));
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("EtcJobFormCount", paramMap); // 총 조회수
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
		
		ArrayList etcJobList = (ArrayList) pelsOutcomeService.getList("EtcJobFormList", paramMap);
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("PWPL_CFY", "2");
		List PlantCode = (ArrayList) pelsOutcomeService.getList("GetPlantCode", map);
		mav.addObject("PlantCode", PlantCode);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		mav.addObject("EtcJobList", etcJobList);
		
		mav.addObject("PPCD", PPCD);
		mav.addObject("PWPL_CFY", PWPL_CFY);
		mav.addObject("MTNG_DY_S", MTNG_DY_S);
		mav.addObject("MTNG_DY_E", MTNG_DY_E);
		mav.addObject("WRK_NM", WRK_NM);
		
		mav.addObject("LOGIN_PWPL_CFY", LOGIN_PWPL_CFY);
		mav.addObject("LOGIN_PPCD", LOGIN_PPCD);
		mav.addObject("LOGIN_DIVS_CD", LOGIN_DIVS_CD);
		mav.addObject("LOGIN_USER_ID", LOGIN_USER_ID);
		mav.addObject("LOGIN_USER_NM", LOGIN_USER_NM);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsOutcomeService.getList("GetPlantCode", paramMap);
		
		mav.addObject("plantList", plantList);
		
		// 검색조건 재입력
		mav.addObject("FRM_NM", FRM_NM);
		mav.setViewName("/pels/outcome/Outcome_Job_Search");
		
		return mav;
	}	

	
	/**
	 * 결과관리 > 일반양식
	 * @param request
	 * @return
	 */
	/*
	@RequestMapping(value= {"/Etc_Outcome_Search.do", "/Etc_Outcome_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView etcOutcomeSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), ""); // 제목
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), ""); // 제목
		
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("REGPR_NM", "");
		paramMap.put("FRM_CFY", FRM_CFY);
		
		int TCNT = pelsOutcomeService.getCount("EtcFormCount", paramMap); // 총 조회수
		ArrayList etcOutcomeList = (ArrayList) pelsOutcomeService.getList("EtcFormList", paramMap);
		if ("/Etc_Outcome_Search_M.do".equals(request.getRequestURI())) {
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("etcOutcomeList", etcOutcomeList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			mav.addObject("TCNT", TCNT);
			mav.addObject("etcOutcomeList", etcOutcomeList);
			
			// 검색조건 재입력
			mav.addObject("FRM_NM", FRM_NM);
			
			mav.setViewName("/pels/outcome/Etc_Outcome_Search");
		}
		return mav;
	}
	*/
	
	/**
	 * 결과관리 > 작업전회의 현황
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Etc_Job_Search.do", "/Etc_Job_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView EtcJobSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		HttpSession session = request.getSession();
		
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));		
		
		String PLANT_TYPE = StringUtil.nvl(request.getParameter("PLANT_TYPE"), ""); 
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); 
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), ""); 
		String PLANT = StringUtil.nvl(request.getParameter("PLANT"), ""); 
		String DEPT_NM = StringUtil.nvl(request.getParameter("DEPT_NM"), "");
		if(!"".equals(PLANT_TYPE)) {
			session.setAttribute("LOGIN_USER_ID", USER_ID);
			session.setAttribute("LOGIN_USER_NM", USER_NM);
			session.setAttribute("LOGIN_DIVS_CD", PLANT.substring(0,3));
			session.setAttribute("LOGIN_PPCD", PLANT);
			session.setAttribute("LOGIN_PWPL_CFY", PLANT_TYPE);
			session.setAttribute("LOGIN_PPCD_NM", "");
			session.setAttribute("LOGIN_TYPE_CD", PLANT_TYPE);
			session.setAttribute("LOGIN_DEPT_NM", DEPT_NM);
		}
		
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.minusDays(30);
		LocalDate endDate = nowDate;
		
		String LOGIN_PWPL_CFY = (String) session.getAttribute("LOGIN_PWPL_CFY");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String LOGIN_USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String LOGIN_DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		LOGIN_PWPL_CFY = StringUtil.nvl(request.getParameter("LOGIN_PWPL_CFY"), LOGIN_PWPL_CFY); 
		LOGIN_PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), LOGIN_PPCD); 
		LOGIN_USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), LOGIN_USER_ID); 
		LOGIN_USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), LOGIN_USER_NM); 
		LOGIN_DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), LOGIN_DIVS_CD);
		
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), LOGIN_PPCD); 
		String PWPL_CFY = StringUtil.nvl(request.getParameter("PWPL_CFY"), LOGIN_PWPL_CFY); 
		//if("".equals(LOGIN_PPCD) || LOGIN_PPCD == null) {
		//	LOGIN_PPCD = "3330";
		//	LOGIN_PWPL_CFY = "2";
		//}
		if("0".equals(LOGIN_PWPL_CFY)) {
			LOGIN_PPCD = "";
		}
		
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), ""); // 제목
		String WRK_NM = StringUtil.nvl(request.getParameter("WRK_NM"), ""); // 제목
		String MTNG_DY_S = StringUtil.nvl(request.getParameter("MTNG_DY_S"), startDate.format(formatter)); 	// 시작일자
		String MTNG_DY_E = StringUtil.nvl(request.getParameter("MTNG_DY_E"), endDate.format(formatter)); // 종료일자
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("WRK_NM", WRK_NM);
		paramMap.put("REGPR_NM", "");
		paramMap.put("FRM_CFY", "");
		
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", PPCD);
		paramMap.put("PWPL_CFY", PWPL_CFY);
		paramMap.put("MTNG_DY_S", MTNG_DY_S.replaceAll("-", ""));
		paramMap.put("MTNG_DY_E", MTNG_DY_E.replaceAll("-", ""));
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("EtcJobFormCount", paramMap); // 총 조회수
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
		
		ArrayList etcJobList = (ArrayList) pelsOutcomeService.getList("EtcJobFormList", paramMap);
		if ("/Etc_Job_Search_M.do".equals(request.getRequestURI())) {
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("etcJobList", etcJobList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			
			HashMap<String, Object> map = new HashMap<String, Object>();
			map.put("PWPL_CFY", "2");

			List PlantCode = (ArrayList) pelsOutcomeService.getList("GetPlantCode", map);
			mav.addObject("TCNT", TCNT);
			mav.addObject("PAGE", PAGE);
			mav.addObject("TOTALPAGE", TOTALPAGE);
			mav.addObject("STARTPAGE", STARTPAGE);
			mav.addObject("ENDPAGE", ENDPAGE);
			mav.addObject("LISTCNT", LISTCNT);

			mav.addObject("EtcJobList", etcJobList);
			mav.addObject("PlantCode", PlantCode);
			mav.addObject("PPCD", PPCD);
			mav.addObject("PWPL_CFY", PWPL_CFY);
			mav.addObject("MTNG_DY_S", MTNG_DY_S);
			mav.addObject("MTNG_DY_E", MTNG_DY_E);
			mav.addObject("WRK_NM", WRK_NM);
			
			mav.addObject("LOGIN_PWPL_CFY", LOGIN_PWPL_CFY);
			mav.addObject("LOGIN_PPCD", LOGIN_PPCD);
			mav.addObject("LOGIN_DIVS_CD", LOGIN_DIVS_CD);
			mav.addObject("LOGIN_USER_ID", LOGIN_USER_ID);
			mav.addObject("LOGIN_USER_NM", LOGIN_USER_NM);
			
			// 검색조건 재입력
			mav.addObject("FRM_NM", FRM_NM);
			mav.setViewName("/pels/outcome/Etc_Job_Search");
		}
		
		return mav;
	}	
	
	@RequestMapping(value="/Etc_Job_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String LOGIN_PWPL_CFY = (String) session.getAttribute("LOGIN_PWPL_CFY");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String LOGIN_USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String LOGIN_DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		
		LOGIN_PWPL_CFY = StringUtil.nvl(request.getParameter("LOGIN_PWPL_CFY"), LOGIN_PWPL_CFY); 
		LOGIN_PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), LOGIN_PPCD); 
		LOGIN_USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), LOGIN_USER_ID); 
		LOGIN_USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), LOGIN_USER_NM); 
		LOGIN_DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), LOGIN_DIVS_CD);		
		
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), LOGIN_PPCD); 
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), LOGIN_PWPL_CFY); 
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); 

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_NM", "");
		paramMap.put("REGPR_NM", "");
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		mav.addObject("PPCD", PPCD);
		mav.addObject("FRM_CFY", FRM_CFY);
		
		mav.addObject("LOGIN_PWPL_CFY", LOGIN_PWPL_CFY);
		mav.addObject("LOGIN_PPCD", LOGIN_PPCD);
		mav.addObject("LOGIN_USER_ID", LOGIN_USER_ID);
		mav.addObject("LOGIN_USER_NM", LOGIN_USER_NM);
		mav.addObject("LOGIN_DIVS_CD", LOGIN_DIVS_CD);
		
		switch(FRM_CFY) {
			case "GEN":
			case "REP":
				mav.addObject("FRM_CFY", FRM_CFY);
				mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				mav.setViewName("/pels/outcome/Etc_Job_Input");
				break;
			case "MAN":
				mav.setViewName("/pels/outcome/Etc_JobMan_Input");
				break;
		}
		
		return mav;
	}
	
	@RequestMapping(value="/Etc_JobForm_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Etc_JobForm_Input (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); 
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		Map<String, String> formDetail = pelsFormService.getDetail("EtcFormDetail", paramMap);
		if(formDetail != null) {
			mav.addObject("ATFL_PHCL_NM1", formDetail.get("ATFL_PHCL_NM")); // 서식1 파일경로
		}
		
		switch(FRM_UNQ_KY_VAL) {
			case "1":
				mav.addObject("subTitle", "일반 작업전회의 점검표");
				break;
			case "2":
				mav.addObject("subTitle", "정비 작업전회의 점검표");
				break;
		}
		
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		mav.setViewName("/pels/outcome/Etc_JobForm_Input");
		
		return mav;
	}
	
	/**
	 * 작업전회의를 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Etc_JobForm_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> etcFormSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");
		
		// 화면에서 넘겨받은 값
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String FRM_CFY = "JOB";
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_NM", "");
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("FRM_CFY", FRM_CFY);
		paramMap.put("ATFL_TITL_NM1", "");
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		paramMap.put("DIVS_CD", StringUtil.nvl(DIVS_CD, ""));
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		
		// 그룹명
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.ETC_FRM_M);
		paramMap.put("FRM_CFY", FrmCfy.fromString(FRM_CFY));
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";
		
		paramMap.put("callMethod", "UPDATE");
		
		try {
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "서식 저장에 실패하였습니다.";
			log.error("etcFormSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "etcFormSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}

}
