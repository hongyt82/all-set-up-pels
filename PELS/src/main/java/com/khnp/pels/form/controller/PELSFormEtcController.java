package com.khnp.pels.form.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.FrmCfy;
import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

/**
 * 절차서(서식)관리 > 작업전회의
 * 절차서(서식)관리 > 일반양식(서식)
 * 절차서(서식)관리 > 일반양식(필기)
 * @author dev004
 *
 */
@Controller
public class PELSFormEtcController {
	
	private static final Logger log = LoggerFactory.getLogger(PELSFormEtcController.class);
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 절차서(서식)관리 > 작업전회의
	 * 절차서(서식)관리 > 일반양식(서식)
	 * 절차서(서식)관리 > 일반양식(필기)
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Etc_Search.do", "/Etc_Form_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView etcFormSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		HttpSession session = request.getSession();
		String LOGIN_DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String LOGIN_USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_PPCD_NM = (String) session.getAttribute("LOGIN_PPCD_NM");
		
		// todo: 유저 세션, 조회조건 초기세팅, ...
		String REGPR_ID = StringUtil.nvl(request.getParameter("USER_ID"), "");
		String REGPR_NM = StringUtil.nvl(request.getParameter("REGPR_NM"), "");
		String SH_FRM_NM = StringUtil.nvl(request.getParameter("SH_FRM_NM"), "");
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), "");
		String subTitle = FrmCfy.fromString(FRM_CFY).getSubTitle();
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), LOGIN_PPCD);
		String MY_DATA = StringUtil.nvl(request.getParameter("MY_DATA"), "");
		
		if("".equals(REGPR_ID)) REGPR_ID = LOGIN_USER_ID;
		
		if( PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", PPCD);
		paramMap.put("FRM_NM", SH_FRM_NM);
		paramMap.put("REGPR_NM", REGPR_NM);
		paramMap.put("FRM_CFY", FRM_CFY);
		paramMap.put("REGPR_ID", REGPR_ID);
		paramMap.put("MY_DATA", MY_DATA);
		
		if ("/Etc_Form_Search_M.do".equals(request.getRequestURI())) {
			ArrayList etcFormList = (ArrayList) pelsFormService.getList("EtcFormList", paramMap);

			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("etcFormList", etcFormList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			
			mav.addObject("JSONDATA", JSONDATA);
			
			mav.setViewName("/pels/Json");
		}
		else {
			//int TCNT = pelsFormService.getCount("EtcFormCount", paramMap); // 총 조회수
			
			ArrayList etcFormList = (ArrayList) pelsFormService.getList("EtcFormList", paramMap);
			mav.addObject("TCNT", etcFormList.size());
			mav.addObject("etcFormList", etcFormList);
			
			// 검색조건 재입력
			mav.addObject("SH_FRM_NM", SH_FRM_NM);
			mav.addObject("REGPR_NM", REGPR_NM);
			mav.addObject("FRM_CFY", FRM_CFY);
			mav.addObject("MY_DATA", MY_DATA);
			
			mav.addObject("subTitle", subTitle);
			if("N".equals(MY_DATA)) {
				mav.addObject("subTitle", "부서 PDF 조회");
			}
			
			paramMap.put("PWPL_CFY", "4");
			ArrayList plantList = (ArrayList)pelsFormService.getList("GetPlantCode", paramMap);
			mav.addObject("plantList", plantList);
			
			mav.setViewName("/pels/form/Form_Etc_Search");
		}
		
		return mav;
	}
	
	/**
	 * 절차서(서식)관리 > 작업전회의 > 작업전회의 등록
	 * 절차서(서식)관리 > 일반양식(서식) > 일반양식(서식) 등록
	 * 절차서(서식)관리 > 일반양식(필기) > 일반양식(필기) 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Etc_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView etcFormInput (HttpServletRequest request) {
		
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_USER_JIKJE = (String) session.getAttribute("LOGIN_USER_JIKJE");
		String LOGIN_USER_DEPT_CD = (String) session.getAttribute("LOGIN_USER_DEPT_CD");

		String SH_FRM_NM = StringUtil.nvl(request.getParameter("SH_FRM_NM"), ""); // 시험고유키값

		ModelAndView mav = new ModelAndView();

		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		FrmCfy frmCfy = FrmCfy.fromString(request.getParameter("FRM_CFY")); // 서식구분
		String atctFileCfy = frmCfy.getCode().equals("PDF") ? "양식 첨부(PDF)" : "서식 첨부(OZR)"; 
		String MY_DATA = StringUtil.nvl(request.getParameter("MY_DATA"), "");
		
		//mav.addObject("SH_FRM_NM", SH_FRM_NM);
		mav.addObject("FRM_CFY", frmCfy.getCode());
		mav.addObject("subTitle", frmCfy.getSubTitle());
		mav.addObject("ATCT_FILE_CFY", atctFileCfy);
		mav.addObject("USER_DEPT_CD", LOGIN_USER_DEPT_CD);
		mav.addObject("USER_JIKJE", LOGIN_USER_JIKJE);
		mav.addObject("MY_DATA", MY_DATA);
		
		mav.setViewName("/pels/form/Form_Etc_Input");
		return mav;
	}
	
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Etc_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Form_Etc_Detail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_USER_JIKJE = (String) session.getAttribute("LOGIN_USER_JIKJE");
		String LOGIN_USER_DEPT_CD = (String) session.getAttribute("LOGIN_USER_DEPT_CD");
		
		String SH_FRM_NM = StringUtil.nvl(request.getParameter("SH_FRM_NM"), ""); // 시험고유키값
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 시험고유키값
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), ""); // 시험고유키값
		String MY_DATA = StringUtil.nvl(request.getParameter("MY_DATA"), "");
		
		// 시험점검이력정보(GE_PL_CHECK_S) 조회
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		Map<String, String> EtcFormDetail = pelsFormService.getDetail("EtcFormDetail", paramMap);
		
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("FRM_CFY", FRM_CFY);
		mav.addObject("MY_DATA", MY_DATA);
		mav.addObject("SH_FRM_NM", SH_FRM_NM);
		if(EtcFormDetail != null) {
			mav.addObject("FRM_NM", EtcFormDetail.get("FRM_NM"));
			mav.addObject("ATFL_PHCL_NM1", EtcFormDetail.get("ATFL_PHCL_NM"));
			mav.addObject("OPPB_CFY", EtcFormDetail.get("OPPB_CFY"));
		}
		
		mav.setViewName("/pels/form/Form_Etc_Detail");
		return mav;
	}

	/**
	 * 작업전회의를 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Form_Etc_Insert_Ajax.do", "/Form_Etc_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> etcFormSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_USER_JIKJE = (String) session.getAttribute("LOGIN_USER_JIKJE");
		String LOGIN_USER_DEPT_CD = (String) session.getAttribute("LOGIN_USER_DEPT_CD");
		
		// 화면에서 넘겨받은 값
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 시험고유키값
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), ""); 		// 양식 제목
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), ""); 		// 서식구분
		
		String HOLD_SCCD = StringUtil.nvl(request.getParameter("HOLD_SCCD"), LOGIN_USER_DEPT_CD);
		String USER_OFCD = StringUtil.nvl(request.getParameter("USER_OFCD"), LOGIN_USER_JIKJE);
		String OPPB_CFY = StringUtil.nvl(request.getParameter("OPPB_CFY"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("FRM_CFY", FRM_CFY);
		paramMap.put("ATFL_TITL_NM1", "");
		
		paramMap.put("HOLD_SCCD", HOLD_SCCD);
		paramMap.put("USER_OFCD", USER_OFCD);
		paramMap.put("OPPB_CFY", OPPB_CFY);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		paramMap.put("DIVS_CD", StringUtil.nvl(DIVS_CD, ""));
		
		if( PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		
		// 그룹명
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.ETC_FRM_M);
		paramMap.put("FRM_CFY", FrmCfy.fromString(FRM_CFY));
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";
		
		if ("/Form_Etc_Insert_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "INSERT");
		}
		else if ("/Form_Etc_Update_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "UPDATE");
		}
		
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
	
	/**
	 * 선택된 작업전회의를 삭제한다.
	 * @param request
	 * @param attributes
	 * @return
	 */
	@RequestMapping(value="/Form_Etc_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> etcFormDelete (HttpServletRequest request) {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		
		// 그룹명
		map.put("ATFL_GRUP_NM", AtflGrupNm.ETC_FRM_M);
		
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultMsg =  pelsFormLogicService.formDelete(map);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "서식 삭제에 실패하였습니다.";
			log.error("etcFormDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "etcFormDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
}
