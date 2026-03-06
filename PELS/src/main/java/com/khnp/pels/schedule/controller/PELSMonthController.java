package com.khnp.pels.schedule.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.schedule.service.PELSScheduleLogicService;
import com.khnp.pels.schedule.service.PELSScheduleService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSMonthController {
	private static final Logger log = LoggerFactory.getLogger(PELSScheduleController.class);

	@Autowired
	private PELSScheduleLogicService pelsScheduleLogicService;
	
	@Autowired
	private PELSScheduleService pelsScheduleService;
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 일정관리 > 월별 시험계획표
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Month_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView monthSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 조회일자 초기세팅
		LocalDate nowDate = LocalDate.now();
		
		String SH_YEAR = StringUtil.nvl(request.getParameter("SH_YEAR"),"");
		String SH_MONTH = StringUtil.nvl(request.getParameter("SH_MONTH"),"");
		
		String SCHDL_PLN_DY = "";
		if("".equals(SH_YEAR)) {
			SCHDL_PLN_DY =  nowDate.format(formatter);
			SH_YEAR = SCHDL_PLN_DY.split("-")[0];
			SH_MONTH = Integer.parseInt(SCHDL_PLN_DY.split("-")[1]) + "";
		}
		else {
			SCHDL_PLN_DY = SH_YEAR + "-" + String.format("%02d", Integer.parseInt(SH_MONTH)) + "-01";
		}
		
		List monthList = pelsScheduleLogicService.getMonth(SCHDL_PLN_DY);
		
		List firstMonthList = monthList.subList(0, monthList.size()/2+1);
		List secondMonthList = monthList.subList(monthList.size()/2+1, monthList.size());
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsScheduleService.getList("GetPlantCode", paramMap);
		
		mav.addObject("plantList", plantList);
		
		mav.addObject("firstMonthList", firstMonthList);
		mav.addObject("secondMonthList", secondMonthList);
		mav.addObject("SH_YEAR", SH_YEAR);
		mav.addObject("SH_MONTH", SH_MONTH);
		
		mav.setViewName("/pels/schedule/Month_Search");
		
		return mav;
	}
	
	

	/**
	 * 일정관리 > 월별 시험계획표 > 월별 시험계획표 등록 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Month_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView monthInput (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""); // 
		
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		
		Map<String, String> formDetail = pelsScheduleService.getDetail("MonthDetail", paramMap);
		
		mav.addObject("UNQ_KY_VAL", UNQ_KY_VAL);
		mav.addObject("SCHDL_PLN_DY", formDetail.get("FM_SCHDL_PLN_DY"));
		
		if(formDetail != null) {
			mav.addObject("TH1_ITM_NM", formDetail.get("TH1_ITM_NM"));
			mav.addObject("TH2_ITM_NM", formDetail.get("TH2_ITM_NM"));
			mav.addObject("TH3_ITM_NM", formDetail.get("TH3_ITM_NM"));
			mav.addObject("TH4_ITM_NM", formDetail.get("TH4_ITM_NM"));		
		}
		
		mav.setViewName("/pels/schedule/Month_Input");
		return mav;
	}
	
	/**
	 * 월별 시험계획표를 수정 한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value={"/Month_Update_Ajax.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> monthSave (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""); // 고유번호
				
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		// 화면에서 입력받는 내용
		String TH1_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH1_ITM_NM"), "")); // 정기/주기 시험(N)
		String TH2_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH2_ITM_NM"), "")); // 정기/주기 시험(D)
		String TH3_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH3_ITM_NM"), "")); // 정기/주기 시험(A)
		String TH4_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH4_ITM_NM"), "")); // 회전기기교체운전
		
		String TH1_CFRM_YN = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH1_CFRM_YN"), "")); // 정기/주기 시험(N) 확인여부
		String TH2_CFRM_YN = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH2_CFRM_YN"), "")); // 정기/주기 시험(D) 확인여부
		String TH3_CFRM_YN = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH3_CFRM_YN"), "")); // 정기/주기 시험(A) 확인여부
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		paramMap.put("TH1_ITM_NM", TH1_ITM_NM);
		paramMap.put("TH2_ITM_NM", TH2_ITM_NM);
		paramMap.put("TH3_ITM_NM", TH3_ITM_NM);
		paramMap.put("TH4_ITM_NM", TH4_ITM_NM);
		
		paramMap.put("TH1_CFRM_YN", TH1_CFRM_YN);
		paramMap.put("TH2_CFRM_YN", TH2_CFRM_YN);
		paramMap.put("TH3_CFRM_YN", TH3_CFRM_YN);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			pelsScheduleService.update("UpdateMonth", paramMap);
			resultMsg = "월별 시험계획표 수정이 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "월별 시험계획표 저장에 실패하였습니다.";
			log.error("scheduleSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "monthSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 일정관리 > 월별 시험계획표
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Month_Calendar.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView MonthCalendar (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 조회일자 초기세팅
		LocalDate nowDate = LocalDate.now();
		
		String SH_YEAR = StringUtil.nvl(request.getParameter("SH_YEAR"),"");
		String SH_MONTH = StringUtil.nvl(request.getParameter("SH_MONTH"),"");
		
		String SCHDL_PLN_DY = "";
		if("".equals(SH_YEAR)) {
			SCHDL_PLN_DY =  nowDate.format(formatter);
			SH_YEAR = SCHDL_PLN_DY.split("-")[0];
			SH_MONTH = Integer.parseInt(SCHDL_PLN_DY.split("-")[1]) + "";
		}
		else {
			SCHDL_PLN_DY = SH_YEAR + "-" + String.format("%02d", Integer.parseInt(SH_MONTH)) + "-01";
		}
		
		List monthList = pelsScheduleLogicService.getMonth(SCHDL_PLN_DY);
		
		mav.addObject("monthList", monthList);
		mav.addObject("SH_YEAR", SH_YEAR);
		mav.addObject("SH_MONTH", SH_MONTH);
		
		mav.setViewName("/pels/schedule/Month_Calendar");
		
		return mav;
	}
	
	/**
	 * 월별 시험계획표를 수정 한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value={"/Get_Calendar_Ajax.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, Object> GetCalendar (HttpServletRequest request) {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 조회일자 초기세팅
		LocalDate nowDate = LocalDate.now();
		
		String SH_YEAR = StringUtil.nvl(request.getParameter("SH_YEAR"),"");
		String SH_MONTH = StringUtil.nvl(request.getParameter("SH_MONTH"),"");
		
		String SCHDL_PLN_DY = "";
		if("".equals(SH_YEAR)) {
			SCHDL_PLN_DY =  nowDate.format(formatter);
			SH_YEAR = SCHDL_PLN_DY.split("-")[0];
			SH_MONTH = Integer.parseInt(SCHDL_PLN_DY.split("-")[1]) + "";
		}
		else {
			SCHDL_PLN_DY = SH_YEAR + "-" + String.format("%02d", Integer.parseInt(SH_MONTH)) + "-01";
		}
		
		List monthList =  (ArrayList)pelsScheduleLogicService.getMonth(SCHDL_PLN_DY);
		
		resultMap.put("monthList", monthList);
		
		return resultMap;
	}
	
	

}
