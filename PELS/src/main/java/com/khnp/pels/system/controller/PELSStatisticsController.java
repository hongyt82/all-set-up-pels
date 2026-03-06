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
public class PELSStatisticsController {

	private static final Logger log = LoggerFactory.getLogger(PELSStatisticsController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 시스템관리 > 절차서관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/StatsConnect_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView QRSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		ArrayList StatsConnectList = (ArrayList) pelsProcedureService.getList("StatsConnectList", paramMap); // 정주기시험 리스트
		
		String ChartName = "";
		String ChartVal = "";
		
		for(int i=0; i<StatsConnectList.size(); i++) {
			Map<String, String> Stats  = (Map<String, String>)StatsConnectList.get(i);
			String sName = Stats.get("REGPR_NM");
			String sVal = Stats.get("CNT").toString();
			if(i > 0) { ChartVal += ","; ChartName += ","; };
			ChartName += "'" + sName + "'";
			ChartVal += sVal;
		}
		
		mav.addObject("ChartName", ChartName);
		mav.addObject("ChartVal", ChartVal);
		mav.addObject("StatsConnectList", StatsConnectList);
		
		mav.setViewName("/pels/system/StatsConnect_Search");
		return mav;
	}
	
	/**
	 * 시스템관리 > 절차서관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/StatsExam_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView StatsExamSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "P");
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		
		ArrayList StatsExamList = (ArrayList) pelsProcedureService.getList("StatsExamList", paramMap); // 정주기시험 리스트
		
		String ChartName = "";
		String ChartVal = "";
		
		for(int i=0; i<StatsExamList.size(); i++) {
			Map<String, String> Stats  = (Map<String, String>)StatsExamList.get(i);
			String sName = Stats.get("PRCDOC_NO");
			String sVal = Stats.get("CNT").toString();
			if(i > 0) { ChartVal += ","; ChartName += ","; };
			ChartName += "'" + sName + "'";
			ChartVal += sVal;
		}
		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("ChartName", ChartName);
		mav.addObject("ChartVal", ChartVal);
		mav.addObject("StatsExamList", StatsExamList);
		
		mav.setViewName("/pels/system/StatsExam_Search");
		return mav;
	}	
}
