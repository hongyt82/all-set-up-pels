package com.khnp.pels.system.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
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
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.support.RequestContextUtils;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.FrmCfy;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;
import com.khnp.pels.system.service.PELSProcedureService;

import common.util.HttpConnectionUtil;
import common.util.PELS_FileUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSBoardController {

	private static final Logger log = LoggerFactory.getLogger(PELSBoardController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 시스템관리 > 절차서관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Board_Search.do", "/Board_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView boardSearch (HttpServletRequest request) {
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
		
		String GRUP_CFY_CD = StringUtil.nvl(request.getParameter("GRUP_CFY_CD"), "");
		String BLBR_TITL_NM = StringUtil.nvl(request.getParameter("BLBR_TITL_NM"), "");
		
		paramMap.put("GRUP_CFY_CD", StringUtil.nvl(GRUP_CFY_CD, ""));
		paramMap.put("BLBR_TITL_NM", StringUtil.nvl(BLBR_TITL_NM,""));
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		int TCNT = pelsProcedureService.getCount("BoardCount", paramMap); // 총 조회수
		
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
		
		ArrayList boardList = (ArrayList) pelsProcedureService.getList("BoardList", paramMap); // 정주기시험 리스트
		
		if ("/Board_Search_M.do".equals(request.getRequestURI())) {

			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("boardList", boardList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			
			mav.addObject("JSONDATA", JSONDATA);
			
			mav.setViewName("/pels/Json");
		}
		else {
			mav.addObject("TCNT", TCNT);
			mav.addObject("PAGE", PAGE);
			mav.addObject("TOTALPAGE", TOTALPAGE);
			mav.addObject("STARTPAGE", STARTPAGE);
			mav.addObject("ENDPAGE", ENDPAGE);
			mav.addObject("LISTCNT", LISTCNT);
			
			mav.addObject("GRUP_CFY_CD", GRUP_CFY_CD);
			mav.addObject("BLBR_TITL_NM", BLBR_TITL_NM);
			
			mav.addObject("boardList", boardList);
			
			mav.setViewName("/pels/board/Board_Search");
		}
		
		return mav;
	}
	
	/**
	 * 시스템관리 > 절차서관리 > 절차서 등록 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Board_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView boardInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		String GRUP_CFY_CD = StringUtil.nvl(request.getParameter("GRUP_CFY_CD"), "");
		
		mav.addObject("GRUP_CFY_CD", GRUP_CFY_CD);
		
		mav.setViewName("/pels/board/Board_Input");
		
		return mav;
	}	
	
	@RequestMapping(value={"/Board_Insert_Ajax.do", "/Board_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Board_Insert_Ajax (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = StringUtil.nvl((String) session.getAttribute("LOGIN_DIVS_CD"), "");
		String PPCD = StringUtil.nvl((String) session.getAttribute("LOGIN_PPCD"), "");
		
		USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), USER_ID);
		USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), USER_NM);
		DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), DIVS_CD);
		PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), PPCD);
		
		String GRUP_CFY_CD = StringUtil.nvl(request.getParameter("GRUP_CFY_CD"), "");
		String BLBR_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("BLBR_UNQ_KY_VAL"), "");
		String BLBR_TITL_NM = StringUtil.nvl(request.getParameter("BLBR_TITL_NM"), "");
		String BLBR_CTT = StringUtil.nvl(request.getParameter("BLBR_CTT"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("GRUP_CFY_CD", GRUP_CFY_CD);
		paramMap.put("BLBR_UNQ_KY_VAL", BLBR_UNQ_KY_VAL);
		paramMap.put("BLBR_TITL_NM", BLBR_TITL_NM);
		paramMap.put("BLBR_CTT", BLBR_CTT);
		paramMap.put("FIRST_INPPR_ID", USER_ID);
		paramMap.put("FIRST_INPPR_NM", USER_NM);
		paramMap.put("UPDR_ID", USER_ID);
		paramMap.put("UPDR_NM", USER_NM);
		
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.BOARD_S);
		paramMap.put("FRM_CFY", "");
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";
		
		if ("/Board_Insert_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "INSERT");
		}
		else if ("/Board_Update_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "UPDATE");
		}
		
		try {
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "서식 저장에 실패하였습니다.";
			log.error("etcFormSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "BoradSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	@RequestMapping(value= {"/Board_Insert_M.do", "Board_Update_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Board_Insert_M (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); // 시험고유키값
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), ""); // 시험고유키값
				
		String GRUP_CFY_CD = StringUtil.nvl(request.getParameter("GRUP_CFY_CD"), "");
		String BLBR_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("BLBR_UNQ_KY_VAL"), "");
		String BLBR_TITL_NM = StringUtil.nvl(request.getParameter("BLBR_TITL_NM"), "");
		String BLBR_CTT = StringUtil.nvl(request.getParameter("BLBR_CTT"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("GRUP_CFY_CD", GRUP_CFY_CD);
		paramMap.put("BLBR_UNQ_KY_VAL", BLBR_UNQ_KY_VAL);
		paramMap.put("BLBR_TITL_NM", BLBR_TITL_NM);
		paramMap.put("BLBR_CTT", BLBR_CTT);
		paramMap.put("FIRST_INPPR_ID", USER_ID);
		paramMap.put("FIRST_INPPR_NM", USER_NM);
		paramMap.put("UPDR_ID", USER_ID);
		paramMap.put("UPDR_NM", USER_NM);
		
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.BOARD_S);
		paramMap.put("FRM_CFY", "");
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Board_Insert_M.do".equals(request.getRequestURI())) {
				
				String Cnt = pelsProcedureService.getLastUnqKey("BoardLastUnqNo");
				paramMap.put("BLBR_UNQ_KY_VAL", Cnt);
				
				pelsProcedureService.insert("InsertBoard", paramMap);
				resultMsg = "저장이 완료되었습니다.";
			}
			else if ("/Board_Update_M.do".equals(request.getRequestURI())) {
				pelsProcedureService.update("UpdateBoard", paramMap);
				
				resultMsg = "저장이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("examSave error > {}", e.getMessage(), e);
		}
		
		ArrayList boardList = (ArrayList) pelsProcedureService.getList("BoardDetail", paramMap);
		
		HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
		paramMap2.put("boardList", boardList);
		JSONObject JSONDATA = new JSONObject(paramMap2);
		mav.addObject("JSONDATA", JSONDATA);
		mav.setViewName("/pels/Json");

		return mav;
	}
	
	
	/**
	 * 시스템관리 > 절차서관리 > 절차서 수정 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Board_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView procedureDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		String GRUP_CFY_CD = StringUtil.nvl(request.getParameter("GRUP_CFY_CD"), "");
		String BLBR_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("BLBR_UNQ_KY_VAL"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("GRUP_CFY_CD", GRUP_CFY_CD);
		paramMap.put("BLBR_UNQ_KY_VAL", BLBR_UNQ_KY_VAL);
		Map<String, String> boardDetail = pelsProcedureService.getDetail("BoardDetail", paramMap);
		
		if(boardDetail != null) {
			mav.addObject("boardDetail", boardDetail); 
		}
		
		mav.addObject("GRUP_CFY_CD", GRUP_CFY_CD); // 고유키값
		mav.addObject("BLBR_UNQ_KY_VAL", BLBR_UNQ_KY_VAL);
		
		mav.setViewName("/pels/board/Board_Detail");
		return mav;
	}
	
	/**
	 * 시스템관리 > 절차서관리 > 절차서 수정 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Board_Update.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView boardUpdate (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		String GRUP_CFY_CD = StringUtil.nvl(request.getParameter("GRUP_CFY_CD"), "");
		String BLBR_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("BLBR_UNQ_KY_VAL"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("GRUP_CFY_CD", GRUP_CFY_CD);
		paramMap.put("BLBR_UNQ_KY_VAL", BLBR_UNQ_KY_VAL);
		Map<String, String> boardDetail = pelsProcedureService.getDetail("BoardDetail", paramMap);
		
		if(boardDetail != null) {
			mav.addObject("boardDetail", boardDetail); 
		}
		
		mav.addObject("GRUP_CFY_CD", GRUP_CFY_CD); // 고유키값
		mav.addObject("BLBR_UNQ_KY_VAL", BLBR_UNQ_KY_VAL);
		
		mav.setViewName("/pels/board/Board_Update");
		return mav;
	}

	/**
	 * 선택된 시험(점검)준비를 삭제한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Board_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> examDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");

		String GRUP_CFY_CD = StringUtil.nvl(request.getParameter("GRUP_CFY_CD"), "");
		String BLBR_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("BLBR_UNQ_KY_VAL"), "");
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("GRUP_CFY_CD", GRUP_CFY_CD);
		paramMap.put("BLBR_UNQ_KY_VAL", BLBR_UNQ_KY_VAL);
		paramMap.put("UPDR_ID", USER_ID);
		paramMap.put("UPDR_NM", USER_NM);
		
		try {
			resultCnt = pelsProcedureService.delete("DeleteBoard", paramMap);	
			resultMsg =  "삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "삭제에 실패하였습니다.";
			log.error("examDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "boardDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}	
	
}
