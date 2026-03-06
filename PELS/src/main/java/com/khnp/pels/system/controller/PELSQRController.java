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
public class PELSQRController {

	private static final Logger log = LoggerFactory.getLogger(PELSQRController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 시스템관리 > 절차서관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/QR_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView QRSearch (HttpServletRequest request) {
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
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), "");
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), LOGIN_PPCD);
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		paramMap.put("PRCDOC_CFY", StringUtil.nvl(PRCDOC_CFY,""));
		paramMap.put("PRCDOC_UNQ_KY_VAL", StringUtil.nvl(PRCDOC_UNQ_KY_VAL,""));
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsProcedureService.getCount("QRCount", paramMap); // 총 조회수
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
		
		ArrayList qrList = (ArrayList) pelsProcedureService.getList("QRList", paramMap); // 정주기시험 리스트
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsProcedureService.getList("GetPlantCode", paramMap);
		
		Map<String, String> Detail = pelsProcedureService.getDetail("ProcedureDetail", paramMap);
		if(Detail != null) {
			mav.addObject("PRCDOC_NO", Detail.get("PRCDOC_NO"));     // 절차서번호
			mav.addObject("PRCDOC_NM", Detail.get("PRCDOC_NM"));     // 절차서명
			mav.addObject("ATCT_NM", Detail.get("ATCT_NM")); 	 // 문서유형
		}
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		mav.addObject("PPCD", PPCD);
		
		mav.addObject("qrList", qrList);
		mav.addObject("plantList", plantList);
		
		mav.setViewName("/pels/system/QR_Search");
		return mav;
	}
	
	@RequestMapping(value="/QR_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView QRInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), "");
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_CFY", StringUtil.nvl(PRCDOC_CFY,""));
		paramMap.put("PRCDOC_UNQ_KY_VAL", StringUtil.nvl(PRCDOC_UNQ_KY_VAL,""));
		paramMap.put("PPCD", StringUtil.nvl(PPCD,""));
		
		Map<String, String> Detail = pelsProcedureService.getDetail("ProcedureDetail", paramMap);
		if(Detail != null) {
			mav.addObject("PRCDOC_NO", Detail.get("PRCDOC_NO"));     // 절차서번호
			mav.addObject("PRCDOC_NM", Detail.get("PRCDOC_NM"));     // 절차서명
			mav.addObject("ATCT_NM", Detail.get("ATCT_NM")); 	 // 문서유형
		}
		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		mav.addObject("PPCD", PPCD);		
		
		mav.setViewName("/pels/system/QR_Input");
		return mav;
	}
	
	@RequestMapping(value={"/QR_Insert_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> procedureSave (HttpServletRequest request) throws Exception {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");
		
		String PRCDOC_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), ""));
		String LOCT_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("LOCT_NM"), "")); 
		String QR_CD_INFO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("QR_CD_INFO"), "")); 
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		paramMap.put("LOCT_NM", LOCT_NM);
		paramMap.put("QR_CD_INFO", QR_CD_INFO);
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			pelsProcedureService.insert("InsertQR", paramMap);
			resultMsg = "등록이 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("procedureSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "procedureSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}	
	
	@RequestMapping(value="/QR_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> procedureDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		String PRCDOC_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), ""));
		String LOCT_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("LOCT_NM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		map.put("LOCT_NM", LOCT_NM);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultCnt = pelsProcedureService.delete("DeleteQR", map);	
			resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "삭제에 실패하였습니다.";
			log.error("QRDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "QRDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}	
}
