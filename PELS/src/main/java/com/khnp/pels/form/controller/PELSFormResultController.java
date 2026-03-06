package com.khnp.pels.form.controller;

import java.util.ArrayList;
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
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

/**
 * 절차서(서식)관리 > 정주기시험
 * @author dev004
 *
 */
@Controller
public class PELSFormResultController {

	private static final Logger log = LoggerFactory.getLogger(PELSFormResultController.class);
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 절차서(서식)관리 > 정주기시험
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Form_Result.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("ATCT_NM", ""); // 붙임명
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		// 그룹명
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.CHECK_S);
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";

		paramMap.put("callMethod", "UPDATE");
		try {
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("procedureSave error > {}", e.getMessage(), e);
		}
		
		// 검색조건 재입력
		mav.addObject("resultMsg", resultMsg);
		mav.addObject("resultCd", resultCd);
		
		mav.setViewName("/pels/form/Form_Result");
		return mav;
	}	
}
