package com.khnp.pels.system.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;
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
public class PELSSignController {

	private static final Logger log = LoggerFactory.getLogger(PELSSignController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	
	/**
	 * 시스템관리 > 권한관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Sign_Search.do", "/Sign_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView signSearch (HttpServletRequest request) {
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
		
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), "");
		String REGPR_ID = StringUtil.nvl(request.getParameter("REGPR_ID"), "");
		
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		paramMap.put("SH_APLPR_ID", StringUtil.nvl(REGPR_ID, ""));
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsProcedureService.getCount("SignCount", paramMap); // 총 조회수
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
		
		ArrayList signList = (ArrayList) pelsProcedureService.getList("SignList", paramMap); // 정주기시험 리스트
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsProcedureService.getList("GetPlantCode", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("PPCD", PPCD);
		
		if ("/Sign_Search_M.do".equals(request.getRequestURI())) {
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("signList", signList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			mav.addObject("TCNT", TCNT);
			mav.addObject("signList", signList);
			mav.addObject("plantList", plantList);
			mav.setViewName("/pels/system/Sign_Search");
		}
		
		return mav;
	}
	
	/**
	 * 모바일에서 FormId 관련 값을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Sign_Result_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Sign_Result_M (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String PPCD = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PPCD"), ""));
		String REGPR_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_ID"), "")); 			
		String REGPR_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_NM"), "")); 			
		String SIGN_DATA = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("SIGN_DATA"), ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		paramMap.put("PPCD", PPCD);
		paramMap.put("APLPR_ID", REGPR_ID);
		paramMap.put("APLPR_NM", REGPR_NM);
		paramMap.put("APLPR_SSIGN_IMG_INR_QRY_CTT", SIGN_DATA);
		try {
			pelsProcedureService.delete("DeleteSign", paramMap);
			pelsProcedureService.insert("InsertSign", paramMap);

			resultMsg = "저장이 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("examSave error > {}", e.getMessage(), e);
		}			
		
		resultMap.put("callMethod", "signSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	@RequestMapping(value = {"SignViewer.do"}, method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView JobViewer(HttpServletRequest request) {
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		ModelAndView mav = new ModelAndView();
		Map<String, String> resultMap = new HashMap<String, String>();
		ArrayList formList  = new ArrayList();
		
		String APLPR_ID = StringUtil.nvl(request.getParameter("APLPR_ID"), "");
		
		paramMap.put("PPCD", "");
		paramMap.put("SH_APLPR_ID", StringUtil.nvl(APLPR_ID, ""));
		
		Map<String, String> signDetail = pelsProcedureService.getDetail("SignDetail", paramMap);
		
		mav.addObject("signDetail", signDetail);
		
		mav.setViewName("/pels/popup/SignViewer");
		
		return mav;
	}
	
}
