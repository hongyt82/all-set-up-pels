package com.khnp.pels.form.controller;

import java.util.ArrayList;
import java.util.HashMap;
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
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

/**
 * 절차서(서식)관리 > 점검관리(붙임)
 * @author dev004
 *
 */
@Controller
public class PELSFormAtctController {
	
	private static final Logger log = LoggerFactory.getLogger(PELSFormAtctController.class);
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 절차서(서식)관리 > 점검관리(붙임)
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Atct_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formAtctSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), ""); // 절차서번호
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), ""); // 절차서명
		
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		paramMap.put("PRCDOC_CFY", PrcdocCfy.ATCT.getCode()); // 절차서구분(점검관리(M))
		
		int TCNT = pelsFormService.getCount("FormCount", paramMap); // 총 조회수
		ArrayList formList = (ArrayList) pelsFormService.getList("FormList", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("formList", formList);
		
		// 검색조건 재입력
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		
		mav.setViewName("/pels/form/Form_Atct_Search");
		return mav;
	}


	/**
	 * 절차서(서식)관리 > 점검관리(붙임) > 점검관리(붙임) 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Atct_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formAtctInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		mav.addObject("REGPR_NM", USER_NM);
		
		mav.setViewName("/pels/form/Form_Atct_Input");
		return mav;
	}

	/**
	 * 절차서(서식)관리 > 점검관리(붙임) > 점검관리(붙임) 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Atct_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formAtctDetail (HttpServletRequest request) {
		
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
			mav.addObject("ATCT_NM", formDetail.get("ATCT_NM")); // 붙임명
			mav.addObject("ATCT_CFY", formDetail.get("ATCT_CFY")); // 붙임구분
			
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
		
		mav.setViewName("/pels/form/Form_Atct_Detail");
		return mav;
	}
	
	/**
	 * 점검관리(붙임)을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Form_Atct_Insert_Ajax.do", "/Form_Atct_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formAtctSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); 		// 서식폼고유키값
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), ""); 	// 절차서고유키값
		String PRCDOC_CFY = PrcdocCfy.ATCT.getCode(); 												// 절차서구분(정주기시험(M))
		String ATCT_NM = StringUtil.nvl(request.getParameter("ATCT_NM"), ""); 						// 붙임명
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), ""); 					// 붙임구분
		
		String ATFL_TITL_NM1 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM1"), ""); // 서식1 제목
		String ATFL_TITL_NM2 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM2"), ""); // 서식2 제목
		String ATFL_TITL_NM3 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM3"), ""); // 서식3 제목
		String ATFL_TITL_NM4 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM4"), ""); // 서식4 제목
		String ATFL_TITL_NM5 = StringUtil.nvl(request.getParameter("ATFL_TITL_NM5"), ""); // 서식4 제목
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRCDOC_RVSN_NO", ""); 	// 절차서개정번호
		paramMap.put("ATCT_NM", ATCT_NM); 		// 붙임명
		paramMap.put("ATCT_CFY", ATCT_CFY); 	// 붙임명
		
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
		
		if ("/Form_Atct_Insert_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "INSERT");
		} else if ("/Form_Atct_Update_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "UPDATE");
		}
		
		try {
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "점검관리(붙임) 저장에 실패하였습니다.";
			log.error("procedureSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formAtctSave");
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
	@RequestMapping(value="/Form_Atct_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formAtctDelete (HttpServletRequest request) {
		
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
			resultMsg = "점검관리(붙임) 삭제에 실패하였습니다.";
			log.error("formAtctDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formAtctDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		
		return resultMap;
	}
}
