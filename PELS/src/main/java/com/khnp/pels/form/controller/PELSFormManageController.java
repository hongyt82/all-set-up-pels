package com.khnp.pels.form.controller;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.form.service.PELSFormService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

/**
 * 절차서(서식)관리 > 점검관리(붙임) > 관리항목
 * @author dev004
 *
 */
@Controller
public class PELSFormManageController {
	
	private static final Logger log = LoggerFactory.getLogger(PELSFormManageController.class);
	
	@Autowired
	private PELSFormService pelsFormService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 절차서(서식)관리 > 점검관리(붙임) > 관리항목
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Manage_Search.do", "/Form_Manage_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formManageSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), ""); // 서식고유키값
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		// 정주기서식정보(GE_PL_FRM_M)
		Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
		
		String PRCDOC_NO = formDetail.get("PRCDOC_NO");
		String PRCDOC_NM = formDetail.get("PRCDOC_NM");
		
		// 서식폼ID정보(GE_PL_FRMID_M)
		int TCNT = pelsFormService.getCount("FormManageCount", paramMap); // 총 조회수
		ArrayList formManageList = (ArrayList) pelsFormService.getList("FormManageList", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("formManageList", formManageList);
		
		// 검색조건 재입력
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("ATCT_CFY", ATCT_CFY);
		
		if ("/Form_Manage_Search_M.do".equals(request.getRequestURI())) {
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("formManageList", formManageList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			switch(ATCT_CFY) {
				case "FME":  
					mav.setViewName("/pels/form/Form_MFme_Search");
					break;
				case "SHOWER":  
					mav.setViewName("/pels/form/Form_MShower_Search");
					break;
				default:
					mav.setViewName("/pels/form/Form_Manage_Search");
					break;
			}
		}
		
		return mav;
	}
	
	/**
	 * 절차서(서식)관리 > 점검관리(붙임) > 관리항목 > 관리항목 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Manage_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formManageInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), ""); // 서식고유키값
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 정주기서식정보(GE_MP_FRM_M)
		Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
		
		String PRCDOC_NO = formDetail.get("PRCDOC_NO");
		String PRCDOC_NM = formDetail.get("PRCDOC_NM");
		
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("ATCT_CFY", ATCT_CFY);
		
		switch(ATCT_CFY) {
			case "SHOWER":  
				mav.setViewName("/pels/form/Form_MShower_Input");
				break;			
			case "FME":
				mav.setViewName("/pels/form/Form_MFme_Input");
				break;
			default:
				mav.setViewName("/pels/form/Form_Manage_Input");
				break;
		}
		
		return mav;
	}
	
	/**
	 * 절차서(서식)관리 > 점검관리(붙임) > 점검관리(붙임) 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Manage_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formAtctDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		String UNQ_ID = StringUtil.nvl(request.getParameter("UNQ_ID"), ""); // 서식고유키값
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), ""); // 서식고유키값
		
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL); // 서식고유키값
		mav.addObject("UNQ_ID", UNQ_ID); // 서식고유키값
		mav.addObject("ATCT_CFY", ATCT_CFY); // 절차서명

		// 정주기시험 일정(GE_MP_SCHE_S) 조회
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("UNQ_ID", UNQ_ID);

		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 정주기서식정보(GE_MP_FRM_M)
		Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
		mav.addObject("PRCDOC_NO", formDetail.get("PRCDOC_NO")); // 절차서번호
		mav.addObject("PRCDOC_NM", formDetail.get("PRCDOC_NM")); // 절차서명
		
		Map<String, String> FormManageDetail = pelsFormService.getDetail("FormManageDetail", paramMap);
		if(FormManageDetail != null) {
			mav.addObject("TH1_ITM_NM", FormManageDetail.get("TH1_ITM_NM")); // 대분류
			mav.addObject("TH2_ITM_NM", FormManageDetail.get("TH2_ITM_NM")); // 중분류
			mav.addObject("TH3_ITM_NM", FormManageDetail.get("TH3_ITM_NM")); // 소분류
		}
		
		switch(ATCT_CFY) {
			case "SHOWER":
				mav.setViewName("/pels/form/Form_MShower_Detail");
				break;
			case "FME":
				mav.setViewName("/pels/form/Form_MFme_Detail");
				break;
			default:
				mav.setViewName("/pels/form/Form_Manage_Detail");
				break;
		}
		
		return mav;
	}	
	
	/**
	 * 관리항목을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Form_Manage_Insert_Ajax.do", "/Form_Manage_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formManageSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		request.setCharacterEncoding("UTF-8");
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "")); // 서식고유키값
		
		String UNQ_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("UNQ_ID"), "")); // 관리번호(고유번호)
		String UNQ_ID_NEW = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("UNQ_ID_NEW"), "")); // 관리번호(고유번호)
		String TH1_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH1_ITM_NM"), "")); // 대분류
		String TH2_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH2_ITM_NM"), "")); // 중분류
		String TH3_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH3_ITM_NM"), "")); // 소분류
		
		UNQ_ID = cleanValue(UNQ_ID);
		
		System.out.println("length = " + UNQ_ID.length());
		System.out.println("length = " + UNQ_ID.getBytes("UTF-8").length);
		for (char c : UNQ_ID.toCharArray()) {
			System.out.println(Integer.toHexString(c));	
		}
		
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		paramMap.put("UNQ_ID", UNQ_ID);
		paramMap.put("UNQ_ID_NEW", UNQ_ID_NEW);
		paramMap.put("TH1_ITM_NM", TH1_ITM_NM);
		paramMap.put("TH2_ITM_NM", TH2_ITM_NM);
		paramMap.put("TH3_ITM_NM", TH3_ITM_NM);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Form_Manage_Insert_Ajax.do".equals(request.getRequestURI())) {
				pelsFormService.insert("InsertFormManage", paramMap);
				resultMsg = "관리항목 등록이 완료되었습니다.";
			}
			else if ("/Form_Manage_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsFormService.update("UpdateFormManage", paramMap);
				resultMsg = " 관리항목 수정이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "관리항목 저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		
		resultMap.put("callMethod", "formManageSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 선택된 관리항목을 삭제한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Manage_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formManageDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		String FRM_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "")); // 서식고유키값
		
		CHK_ITEM = CHK_ITEM.replace("&#40;", "(").replace("&#41;", ")");
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		map.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultCnt = pelsFormService.delete("DeleteFormManage", map);	
			resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "관리항목 삭제에 실패하였습니다.";
			log.error("formManageDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formManageDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	public static String cleanValue(String value) {
		if (value == null) return null;
					
		// 유니코드 정규화(겉보기만 괄호 같은 문자들은 ASCII 원형으로 치환)
		value = Normalizer.normalize(value, Normalizer.Form.NFKC);
		// 제어문자 / 탭 / 개행/ 공백류 이상 문제저거
		value = value.replaceAll("[\\p{Cntrl}]", "");	// 컨트롤 문자제거		
		
		return value.replace("\t", "")
					.replace("\r", "")
					.replace("\n", "")
					.replace(" (", "")
					.replace(") ", "")
					.replace("\u00A0", "")
					.replace("\u200B", "")									
					.replace("\u0028", "(")
					.replace("\u0029", ")")
					.replace("&#40;", "(")
					.replace("&#41;", ")")
					.trim();					
	}
}
