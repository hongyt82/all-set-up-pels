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
public class PELSExamScheduleController {
	private static final Logger log = LoggerFactory.getLogger(PELSExamScheduleController.class);

	@Autowired
	private PELSScheduleService pelsScheduleService;
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 일정관리 > 일일작업계획
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_Schedule_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
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
		
		int TCNT = pelsScheduleService.getCount("ExamScheduleCount", paramMap); // 총 조회수
		ArrayList examScheduleList = (ArrayList) pelsScheduleService.getList("ExamScheduleList", paramMap); // 정주기시험일정 리스트
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsScheduleService.getList("GetPlantCode", paramMap);
		
		mav.addObject("plantList", plantList);
		
		// 검색조건 재입력
		mav.addObject("CHCK_DY_S", CHCK_DY_S);
		mav.addObject("CHCK_DY_E", CHCK_DY_E);
		
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("examScheduleList", examScheduleList);
		
		mav.setViewName("/pels/schedule/Exam_Schedule_Search");
		
		return mav;
	}
}
