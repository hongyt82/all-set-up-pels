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
public class PELSFormDrawController {
	
	private static final Logger log = LoggerFactory.getLogger(PELSFormDrawController.class);
	
	@Autowired
	private PELSFormService pelsFormService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 폼ID관리
	 * 절차서(서식)관리 > 점검관리(붙임) > 폼ID관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Draw_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formDrawSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));		

		String SH_DOC_UNQ_ID = StringUtil.nvl(request.getParameter("SH_DOC_UNQ_ID"), "");
		String SH_FRM_ID = StringUtil.nvl(request.getParameter("SH_FRM_ID"), "");
		
		paramMap.put("SH_FRM_ID", SH_FRM_ID);
		paramMap.put("SH_DOC_UNQ_ID", SH_DOC_UNQ_ID);
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsFormService.getCount("FormDrawCount", paramMap);
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
		
		ArrayList formDrawList = (ArrayList) pelsFormService.getList("FormDrawList", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);

		mav.addObject("formDrawList", formDrawList);
		
		mav.addObject("SH_FRM_ID", SH_FRM_ID);
		mav.addObject("SH_DOC_UNQ_ID", SH_DOC_UNQ_ID);
		
		mav.setViewName("/pels/form/Form_Draw_Search");
		
		return mav;
	}

	/**
	 * 절차서(서식)관리 > 정주기시험 > 폼ID관리 > 폼ID관리 등록
	 * 절차서(서식)관리 > 점검관리(붙임) > 폼ID관리 > 폼ID관리 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Draw_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formDrawInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		mav.setViewName("/pels/form/Form_Draw_Input");
		return mav;
	}
	
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Draw_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));

		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("UNQ_KY_VAL", CHK_ITEM);
		Map<String, String> formDetail = pelsFormService.getDetail("FormDrawDetail", paramMap);
		
		mav.addObject("formDetail", formDetail);
		
		mav.setViewName("/pels/form/Form_Draw_Detail");
		
		return mav;
	}
	
	/**
	 * 폼ID를 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Form_Draw_Insert_Ajax.do", "/Form_Draw_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formDrawSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""));
		String FRM_ID = StringUtil.nvl(request.getParameter("FRM_ID"), "");
		
		String DOC_UNQ_ID = StringUtil.nvl(request.getParameter("DOC_UNQ_ID"), "");
		String DOC_TYP = StringUtil.nvl(request.getParameter("DOC_TYP"), "");
		String DOC_PART_CD = StringUtil.nvl(request.getParameter("DOC_PART_CD"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		paramMap.put("FRM_ID", FRM_ID);
		
		paramMap.put("DOC_UNQ_ID", DOC_UNQ_ID);
		paramMap.put("DOC_TYP", DOC_TYP);
		paramMap.put("DOC_PART_CD", DOC_PART_CD);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Form_Draw_Insert_Ajax.do".equals(request.getRequestURI())) {
				pelsFormService.insert("InsertFormDraw", paramMap);
				resultMsg = "등록이 완료되었습니다.";
			}
			else if ("/Form_Draw_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsFormService.update("UpdateFormDraw", paramMap);
				resultMsg = "수정이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formDrawSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 선택된 폼ID를 삭제한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Form_Draw_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formDrawDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		// mybatis in 쿼리 String처리 때문에 변환...
		//List<String> chkItemList = Arrays.stream(CHK_ITEM.split(","))
		//		.map(String::trim).collect(Collectors.toList());
		map.put("UNQ_KY_VAL", CHK_ITEM);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultCnt = pelsFormService.delete("DeleteFormDraw", map);	
			resultMsg =  "삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "삭제에 실패하였습니다.";
			log.error("formIdDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formDrawDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
}
