package com.khnp.pels.form.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
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

import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.form.service.PELSFormService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

/**
 * 절차서(서식)관리 > 정주기시험 > 폼ID관리
 * 절차서(서식)관리 > 점검관리(붙임) > 폼ID관리
 * @author dev004
 *
 */
@Controller
public class PELSFormIdController {
	
	private static final Logger log = LoggerFactory.getLogger(PELSFormIdController.class);
	
	@Autowired
	private PELSFormService pelsFormService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 폼ID관리
	 * 절차서(서식)관리 > 점검관리(붙임) > 폼ID관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Id_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formIdSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));		

		//todo: 유저 세션, 조회조건 초기세팅, ...
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); 		// 서식고유키값
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), ""); 	// 서식고유키값
		String TITL_NM = StringUtil.nvl(request.getParameter("TITL_NM"), ""); 	// 서식고유키값
		String SH_ITM_NM = StringUtil.nvl(request.getParameter("SH_ITM_NM"), ""); 	// 서식고유키값
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		// 정주기서식정보(GE_MP_FRM_M)
		Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
		
		String PRCDOC_NO = formDetail.get("PRCDOC_NO");
		String PRCDOC_NM = formDetail.get("PRCDOC_NM");
		
		String PRCDOC_CFY = formDetail.get("PRCDOC_CFY"); // 절차서구분 정주기시험(P), 점검관리(M)
		String subTitle = PrcdocCfy.fromString(PRCDOC_CFY).getSubTitle();
		String subTitleUrl = PrcdocCfy.fromString(PRCDOC_CFY).getSubTitleUrl(); // 정주기시험: Form_Search.do / 점검관리(붙임): Form_Atct_Search.do

		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		paramMap.put("TITL_NM", TITL_NM);
		paramMap.put("SH_ITM_NM", SH_ITM_NM);
		int TCNT = pelsFormService.getCount("FormIdCount", paramMap);
		int TOTALPAGE = 0;
		if(Math.floorMod(TCNT, LISTCNT) > 0) {
			TOTALPAGE = (TCNT/LISTCNT) + 1;
		} else {
			TOTALPAGE = (TCNT/LISTCNT);
		}

		if((PAGE / LISTCNT) > 0) {
			if(Math.floorMod(PAGE, LISTCNT) > 0) {
				STARTPAGE = (((PAGE / LISTCNT)) * 20) + 1;
			} else {
				STARTPAGE = (((PAGE / LISTCNT) - 1) * 20) + 1;
			}
		} else {
			STARTPAGE = ((PAGE / LISTCNT) * 20) + 1;
		}
		
		ENDPAGE = STARTPAGE + 19;
		if (ENDPAGE > TOTALPAGE) {
			ENDPAGE = TOTALPAGE;
		}
		
		// 서식폼ID정보(GE_MP_FRMID_M)
		ArrayList formIdList = (ArrayList) pelsFormService.getList("FormIdList", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);

		mav.addObject("formIdList", formIdList);
		mav.addObject("subTitle", subTitle);
		mav.addObject("subTitleUrl", subTitleUrl);
		
		// 검색조건 재입력
		mav.addObject("TITL_NM", TITL_NM);
		mav.addObject("SH_ITM_NM", SH_ITM_NM);
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		
		mav.setViewName("/pels/form/Form_Id_Search");
		return mav;
	}

	/**
	 * 절차서(서식)관리 > 정주기시험 > 폼ID관리 > 폼ID관리 등록
	 * 절차서(서식)관리 > 점검관리(붙임) > 폼ID관리 > 폼ID관리 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Id_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formIdInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 정주기서식정보(GE_MP_FRM_M)
		Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
		
		String PRCDOC_CFY = formDetail.get("PRCDOC_CFY"); // 절차서구분 정주기시험(P), 점검관리(M)
		String subTitle = PrcdocCfy.fromString(PRCDOC_CFY).getSubTitle();
		String subTitleUrl = PrcdocCfy.fromString(PRCDOC_CFY).getSubTitleUrl(); // 정주기시험: Form_Search.do / 점검관리(붙임): Form_Atct_Search.do
		
		String PRCDOC_NO = formDetail.get("PRCDOC_NO");
		String PRCDOC_NM = formDetail.get("PRCDOC_NM");
		
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("subTitle", subTitle);
		mav.addObject("subTitleUrl", subTitleUrl);
		
		mav.setViewName("/pels/form/Form_Id_Input");
		return mav;
	}
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Id_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), ""); // 서식고유키값
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), ""); // 서식고유키값
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), ""); // 서식고유키값
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		String FRM_ID = StringUtil.nvl(request.getParameter("FRM_ID"), ""); 				// Form ID
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("FRM_ID", FRM_ID);
		Map<String, String> formDetail = pelsFormService.getDetail("FormIdDetail", paramMap);
		
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("FRM_ID", FRM_ID);
		mav.addObject("TITL_NM", formDetail.get("TITL_NM"));
		mav.addObject("TH1_ITM_NM", formDetail.get("TH1_ITM_NM"));
		mav.addObject("TH2_ITM_NM", formDetail.get("TH2_ITM_NM"));
		mav.addObject("TH3_ITM_NM", formDetail.get("TH3_ITM_NM"));
		mav.addObject("STDVL_VAL_NM", formDetail.get("STDVL_VAL_NM"));
		mav.addObject("UNIT_NM", formDetail.get("UNIT_NM"));
		mav.addObject("CNIF_TAG_NM", formDetail.get("CNIF_TAG_NM"));
		
		mav.setViewName("/pels/form/Form_Id_Detail");
		
		return mav;
	}
	
	/**
	 * 폼ID를 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Form_Id_Insert_Ajax.do", "/Form_Id_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formIdSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "")); // 서식고유키값
		String FRM_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_ID"), "")); // 이폼서식ID
		
		String TITL_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TITL_NM"), "")); // 제목명
		String TH1_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH1_ITM_NM"), "")); // 1번째항목명
		String TH2_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH2_ITM_NM"), "")); // 2번째항목명
		String TH3_ITM_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TH3_ITM_NM"), "")); // 3번째항목명
		String STDVL_VAL_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("STDVL_VAL_NM"), "")); // 기준치
		String CNIF_YN = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CNIF_YN"), "")); // 연계여부
		String CNIF_TAG_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CNIF_TAG_NM"), "")); // 연계여부
		String UNIT_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("UNIT_NM"), "")); // 연계여부
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("FRM_ID", FRM_ID);
		
		paramMap.put("TITL_NM", TITL_NM);
		paramMap.put("TH1_ITM_NM", TH1_ITM_NM);
		paramMap.put("TH2_ITM_NM", TH2_ITM_NM);
		paramMap.put("TH3_ITM_NM", TH3_ITM_NM);
		paramMap.put("STDVL_VAL_NM", STDVL_VAL_NM);
		paramMap.put("UNIT_NM", UNIT_NM);
		paramMap.put("CNIF_YN", CNIF_YN);
		paramMap.put("CNIF_TAG_NM", CNIF_TAG_NM);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Form_Id_Insert_Ajax.do".equals(request.getRequestURI())) {
				pelsFormService.insert("InsertFormId", paramMap);
				resultMsg = "폼ID 등록이 완료되었습니다.";
			}
			else if ("/Form_Id_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsFormService.update("UpdateFormId", paramMap);
				resultMsg = TITL_NM + " 폼ID 수정이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "폼ID 저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		
		resultMap.put("callMethod", "formIdSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 선택된 폼ID를 삭제한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Id_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formIdDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		String FRM_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "")); // 서식고유키값
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		// mybatis in 쿼리 String처리 때문에 변환...
		List<String> chkItemList = Arrays.stream(CHK_ITEM.split(","))
				.map(String::trim).collect(Collectors.toList());
		map.put("CHK_ITEMS", chkItemList);
		map.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultCnt = pelsFormService.delete("DeleteFormId", map);	
			resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "폼ID 삭제에 실패하였습니다.";
			log.error("formIdDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formIdDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
}
