package com.khnp.pels.exam.controller;

import java.io.FileInputStream;
import java.io.File;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
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
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.json.*;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.PrstsCfy;
import com.khnp.pels.exam.service.PELSExamService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.util.HttpConnectionUtil;
import common.util.PELS_FileUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;


@Controller
public class PELSExamJobController {

	private static final Logger log = LoggerFactory.getLogger(PELSExamJobController.class);
	
	@Autowired
	private PELSExamService pelsExamService;
	
	@Autowired
	private PELSFormService pelsFormService;

	@Autowired
	private PELSFormLogicService pelsFormLogicService;

	@Resource(name = "utilProperties")
	private Properties utilProperties;	

	private final SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmssSSS", java.util.Locale.KOREA);
	private final SimpleDateFormat format2 = new SimpleDateFormat("yyyyMMddHHmmSSSss", java.util.Locale.KOREA);
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
		
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	@RequestMapping(value="/Exam_Job_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String LOGIN_PWPL_CFY = (String) session.getAttribute("LOGIN_PWPL_CFY");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String LOGIN_USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String LOGIN_DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		
		LOGIN_PWPL_CFY = StringUtil.nvl(request.getParameter("LOGIN_PWPL_CFY"), LOGIN_PWPL_CFY); 
		LOGIN_PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), LOGIN_PPCD); 
		LOGIN_USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), LOGIN_USER_ID); 
		LOGIN_USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), LOGIN_USER_NM); 
		LOGIN_DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), LOGIN_DIVS_CD);		
		
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), LOGIN_PPCD); 
		if( PPCD == null || "".equals(PPCD)) PPCD = "2330";
		
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), LOGIN_PWPL_CFY); 
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); 
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), ""); 
		String PRCDOC_RVSN_NO = StringUtil.nvl(request.getParameter("PRCDOC_RVSN_NO"), ""); 
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); 
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), ""); 

		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		paramMap.put("PPCD", PPCD);
		paramMap.put("FRM_CFY", "JOB");
		
		paramMap.put("FRM_NM", "");
		paramMap.put("REGPR_NM", "");
		
		ArrayList etcFormList = (ArrayList) pelsExamService.getList("EtcFormList", paramMap);
		
		mav.addObject("PPCD", PPCD);
		mav.addObject("FRM_CFY", FRM_CFY);
		mav.addObject("etcFormList", etcFormList);
		
		mav.addObject("LOGIN_PWPL_CFY", LOGIN_PWPL_CFY);
		mav.addObject("LOGIN_PPCD", LOGIN_PPCD);
		mav.addObject("LOGIN_USER_ID", LOGIN_USER_ID);
		mav.addObject("LOGIN_USER_NM", LOGIN_USER_NM);
		mav.addObject("LOGIN_DIVS_CD", LOGIN_DIVS_CD);
		
		mav.addObject("FRM_CFY", FRM_CFY);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_RVSN_NO", PRCDOC_RVSN_NO);
		
		mav.setViewName("/pels/exam/Exam_Job_Input");
		
		return mav;
	}
	
}
