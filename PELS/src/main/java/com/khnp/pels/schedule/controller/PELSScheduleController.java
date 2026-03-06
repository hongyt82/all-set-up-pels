package com.khnp.pels.schedule.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.support.RequestContextUtils;

import com.khnp.pels.schedule.service.PELSScheduleService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSScheduleController {
	private static final Logger log = LoggerFactory.getLogger(PELSScheduleController.class);

	@Autowired
	private PELSScheduleService pelsScheduleService;
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 일정관리 > 정주기시험 일정
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Schedule_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView scheduleSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 부서관련 초기세팅, ...
		HttpSession session = request.getSession();
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");
		
		// 시험시작, 종료일자 초기세팅
		
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.minusDays(30);
		LocalDate endDate = nowDate;
		
		String CHKPR_FNM = StringUtil.nvl(request.getParameter("CHKPR_FNM"), ""); // 담당자
		
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), ""); // 절차서번호
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), ""); // 절차서명
		String CHCK_DY_S = StringUtil.nvl(request.getParameter("CHCK_DY_S"), startDate.format(formatter)); // 시험시작일자
		String CHCK_DY_E = StringUtil.nvl(request.getParameter("CHCK_DY_E"), endDate.format(formatter)); // 시험종료일자
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", PPCD);
		paramMap.put("CHKPR_FNM", CHKPR_FNM);
		
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		paramMap.put("CHCK_DY_S", CHCK_DY_S.replaceAll("-", ""));
		paramMap.put("CHCK_DY_E", CHCK_DY_E.replaceAll("-", ""));
		
		int TCNT = pelsScheduleService.getCount("ScheduleCount", paramMap); // 총 조회수
		ArrayList scheduleList = (ArrayList) pelsScheduleService.getList("ScheduleList", paramMap); // 정주기시험일정 리스트
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsScheduleService.getList("GetPlantCode", paramMap);
		
		mav.addObject("plantList", plantList);
		
		// 검색조건 재입력
		mav.addObject("CHCK_DY_S", CHCK_DY_S);
		mav.addObject("CHCK_DY_E", CHCK_DY_E);
		
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("scheduleList", scheduleList);
		
		mav.setViewName("/pels/schedule/Schedule_Search");
		return mav;
	}
	
	/**
	 * 일정관리 > 정주기시험 일정 > 정주기시험일정 등록 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Schedule_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView scheduleInput (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		
		// 시험일자 초기세팅, 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		LocalDate nowDate = LocalDate.now();
		
		mav.addObject("REGPR_NM", USER_NM);
		mav.addObject("CHCK_DY", nowDate);
		
		mav.setViewName("/pels/schedule/Schedule_Input");
		return mav;
	}

	/**
	 * 일정관리 > 정주기시험 일정 > 정주기시험일정 수정 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Schedule_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView scheduleDetail (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		
		// 시험일자 초기세팅, 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""); // 고유키값
		
		// 정주기시험 일정(GE_MP_SCHE_S) 조회
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		Map<String, String> scheduleDetail = pelsScheduleService.getDetail("ScheduleDetail", paramMap);
		
		mav.addObject("UNQ_KY_VAL", UNQ_KY_VAL); // 고유키값
		mav.addObject("REGPR_NM", USER_NM); // 등록자명
		
		if(scheduleDetail != null) {
			mav.addObject("PRCDOC_UNQ_KY_VAL", scheduleDetail.get("PRCDOC_UNQ_KY_VAL")); // 절차서고유키값
			mav.addObject("CHCK_DY", scheduleDetail.get("FM_CHCK_DY")); // 점검일자
			mav.addObject("CHKPR_FNM", scheduleDetail.get("CHKPR_FNM")); // 점검일자
			mav.addObject("PRCDOC_NO", scheduleDetail.get("PRCDOC_NO")); // 절차서번호
			mav.addObject("PRCDOC_NM", scheduleDetail.get("PRCDOC_NM")); // 절차서명
			mav.addObject("RRD_CFY", scheduleDetail.get("RRD_CFY")); // 주기
		}
		
		mav.setViewName("/pels/schedule/Schedule_Detail");
		return mav;
	}
	
	/**
	 * 정주기시험일정 등록/수정 한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value={"/Schedule_Insert_Ajax.do", "/Schedule_Update_Ajax.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> scheduleSave (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""); // 고유번호
				
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		// 화면에서 입력받는 내용(필수)
		String PRCDOC_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), "")); // 절차서 고유 번호
		String PRCDOC_NM 		 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_NM"), "")); // 절차서명
		String CHCK_DY 			 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHCK_DY"), "")); // 시험일자
		String CHKPR_FNM 		 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHKPR_FNM"), "")); // 담당자명
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		
		paramMap.put("CHCK_DY", CHCK_DY.replaceAll("-", ""));
		paramMap.put("CHKPR_FNM", CHKPR_FNM);
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if (request.getRequestURI().equals("/Schedule_Insert_Ajax.do")) {
				pelsScheduleService.insert("InsertSchedule", paramMap);
				resultMsg = "일정 등록이 완료되었습니다.";
			}
			else if (request.getRequestURI().equals("/Schedule_Update_Ajax.do")) {
				pelsScheduleService.update("UpdateSchedule", paramMap);
				resultMsg = PRCDOC_NM + " 일정 수정이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "정주기시험 일정 저장에 실패하였습니다.";
			log.error("scheduleSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "scheduleSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 선택된 정주기시험 일정을 삭제한다.
	 * @param request
	 * @param attributes
	 * @return
	 */
	@RequestMapping(value="/Schedule_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> scheduleDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultCnt = pelsScheduleService.delete("DeleteSchedule", map);	
			resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "정주기시험 일정 삭제에 실패하였습니다.";
			log.error("procedureDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "procDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
}
