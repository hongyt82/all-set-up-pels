package com.khnp.pels.system.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
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

import com.khnp.pels.system.service.PELSProcedureService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSGradeController {

	private static final Logger log = LoggerFactory.getLogger(PELSGradeController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 시스템관리 > 권한관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Grade_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView procedureSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));		
		
		//todo: 유저 세션, 조회조건 부서관련 초기세팅, ...
		HttpSession session = request.getSession();
		String LOGIN_DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_PPCD_NM = (String) session.getAttribute("LOGIN_PPCD_NM");
		
		String SH_PPCD = StringUtil.nvl(request.getParameter("SH_PPCD"), "");
		paramMap.put("SH_PPCD", StringUtil.nvl(SH_PPCD, ""));
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsProcedureService.getCount("GradeCount", paramMap); // 총 조회수
		int TOTALPAGE = 0;
		if(Math.floorMod(TCNT, LISTCNT) > 0) {
			TOTALPAGE = (TCNT/LISTCNT) + 1;
		} else {
			TOTALPAGE = (TCNT/LISTCNT);
		}

		if((PAGE / LISTCNT) > 0) {
			if(Math.floorMod(PAGE, LISTCNT) > 0) {
				STARTPAGE = (((PAGE / LISTCNT)) * LISTCNT) + 1;
			} else {
				STARTPAGE = (((PAGE / LISTCNT) - 1) * LISTCNT) + 1;
			}
		} else {
			STARTPAGE = ((PAGE / LISTCNT) * LISTCNT) + 1;
		}
		
		ENDPAGE = STARTPAGE + LISTCNT - 1;
		if (ENDPAGE > TOTALPAGE) {
			ENDPAGE = TOTALPAGE;
		}
		
		ArrayList gradeList = (ArrayList) pelsProcedureService.getList("GradeList", paramMap); // 정주기시험 리스트
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsProcedureService.getList("GetPlantCode", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("SH_PPCD", SH_PPCD);
		
		mav.addObject("gradeList", gradeList);
		mav.addObject("plantList", plantList);
		
		mav.setViewName("/pels/system/Grade_Search");
		return mav;
	}
	
	/**
	 * 시스템관리 > 권한관리 > 권한 등록 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Grade_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView gradeInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		mav.addObject("REGPR_NM", USER_NM);
		
		mav.setViewName("/pels/system/Grade_Input");
		
		return mav;
	}	
	
	/**
	 * 시스템관리 > 권한관리 > 권한 수정 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Grade_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView procedureDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("USER_ID", USER_ID);
		Map<String, String> gradeDetail = pelsProcedureService.getDetail("GradeDetail", paramMap);
		
		if(gradeDetail != null) {
			mav.addObject("Detail", gradeDetail); 
		}
		
		mav.setViewName("/pels/system/Grade_Detail");
		
		return mav;
	}
	
	
	/**
	 * 권한을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Grade_Insert_Ajax.do", "/Grade_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> procedureSave (HttpServletRequest request) throws Exception {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String REGPR_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String REGPR_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String USER_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("USER_ID"), ""));
		String USER_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("USER_NM"), "")); 
		String PPCD = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PPCD"), "")); 
		String RG_SCCD = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("RG_SCCD"), "")); 
		String HOLD_SCCD = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("HOLD_SCCD"), "")); 
		String RELTN_SCTN_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("RELTN_SCTN_NM"), "")); 
		String ATTY_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("ATTY_CFY"), "")); 
		String RMK = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("RMK"), "")); 
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("USER_ID", USER_ID);
		paramMap.put("USER_NM", USER_NM);
		paramMap.put("PPCD", PPCD);
		paramMap.put("RG_SCCD", RG_SCCD);
		paramMap.put("HOLD_SCCD", HOLD_SCCD);
		paramMap.put("RELTN_SCTN_NM", RELTN_SCTN_NM);
		paramMap.put("ATTY_CFY", ATTY_CFY);
		paramMap.put("RMK", RMK);
		paramMap.put("REGPR_ID", REGPR_ID);
		paramMap.put("REGPR_NM", REGPR_NM);
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Grade_Insert_Ajax.do".equals(request.getRequestURI())) {
				pelsProcedureService.insert("InsertGrade", paramMap);
				resultMsg = "등록이 완료되었습니다.";
			}
			else if ("/Grade_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsProcedureService.update("UpdateGrade", paramMap);
				resultMsg = "수정이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("gradeSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "gradeSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 권한을 삭제한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Grade_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> procedureDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("USER_ID", CHK_ITEM);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultCnt = pelsProcedureService.delete("DeleteGrade", map);	
			resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "삭제에 실패하였습니다.";
			log.error("gradeDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "gradeDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}	
	
}
