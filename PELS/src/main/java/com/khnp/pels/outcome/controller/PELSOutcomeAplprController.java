package com.khnp.pels.outcome.controller;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.dto.CommonFileDTO;
import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.FrmCfy;
import com.khnp.pels.common.enums.PrcdocCfy;
import com.khnp.pels.common.enums.PrstsCfy;
import com.khnp.pels.common.service.PELSFileService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;
import com.khnp.pels.outcome.service.PELSOutcomeService;

import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;

import com.google.gson.JsonObject;
import common.util.StringUtil;
import common.xss.JsonXssFilter;
import common.util.HttpConnectionUtil;
import common.util.PELS_FileUtil;

/**
 * 결과관리 > 정주기시험
 * 결과관리 > 점검관리(붙임)
 * 결과관리 > 일반양식
 * @author dev004
 *
 */
@Controller
public class PELSOutcomeAplprController {
	private static final Logger log = LoggerFactory.getLogger(PELSOutcomeAplprController.class);
	
	@Autowired
	private PELSFileService pelsFileService;	
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	@Autowired
	private PELSOutcomeService pelsOutcomeService;
	
	@Resource(name = "utilProperties")
	private Properties utilProperties;	
	
	private final SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmssSSS", java.util.Locale.KOREA);
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();

	@RequestMapping(value = "Aplpr_Popup.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView UserPopup(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		Map<String, String> resultMap = new HashMap<String, String>();
		
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String JIKWI = StringUtil.nvl((String) session.getAttribute("LOGIN_USER_JIKWI"), "");
		String PPCD = StringUtil.nvl((String) session.getAttribute("LOGIN_PPCD"), "");
		
		String APRV_STEP_CFY = StringUtil.nvl(request.getParameter("APRV_STEP_CFY"), "");
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String OZD_NAME = StringUtil.nvl(request.getParameter("OZD_NAME"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		ArrayList outcomeAplprList = (ArrayList) pelsOutcomeService.getList("OutcomeAplprList", paramMap);
		
		mav.addObject("PPCD", PPCD);
		mav.addObject("APRV_STEP_CFY", APRV_STEP_CFY);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("OZD_NAME", OZD_NAME);

		mav.addObject("USER_ID", USER_ID);
		mav.addObject("USER_NM", USER_NM);
		mav.addObject("JIKWI", JIKWI);

		mav.addObject("outcomeAplprList", outcomeAplprList);
		
		mav.setViewName("/pels/popup/Aplpr_Popup");
		
		return mav;
	}
	
	/**
	 * 결재선을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Aplpr_Insert_Ajax.do", "/Aplpr_Delete_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> aplprSave (HttpServletRequest request) throws Exception {
		String OZ_HOME = utilProperties.getProperty("OZ_HOME");
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");
		
		String TST_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""));
		String APRV_STEP_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_STEP_CFY"), ""));
		String OZD_NAME = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("OZD_NAME"), ""));
		
		System.out.println("================================================");
		System.out.println("OZD_NAME : " + OZD_NAME);
		System.out.println("================================================");
		
		String APLPR_ID1 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_ID1"), "")); 
		String APLPR_NM1 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_NM1"), "")); 
		String APLPR_ID2 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_ID2"), "")); 
		String APLPR_NM2 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_NM2"), "")); 
		String APLPR_ID3 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_ID3"), "")); 
		String APLPR_NM3 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_NM3"), "")); 
		String APLPR_ID4 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_ID4"), "")); 
		String APLPR_NM4 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_NM4"), "")); 
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("APRV_CFY", "1");
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Aplpr_Insert_Ajax.do".equals(request.getRequestURI())) {
				
				int iAPRV_STEP_CFY = Integer.valueOf(APRV_STEP_CFY);
				
				pelsOutcomeService.delete("DeleteAplpr", paramMap);

				paramMap.put("APRV_SEQ", "1");
				paramMap.put("APLPR_ID", APLPR_ID1);
				paramMap.put("APLPR_NM", APLPR_NM1);
				paramMap.put("APLPR_SCTN_ID", "");
				paramMap.put("APLPR_SCTN_NM", "");
				paramMap.put("APRV_YN", "Y");
				paramMap.put("APRV_DT", "I");
				paramMap.put("APLPR_OPNN_CTT", "");
				paramMap.put("APRV_TYP", "N");
				paramMap.put("APLPR_JBPS_NM", "");
				pelsOutcomeService.insert("InsertAplpr", paramMap);
				
				paramMap.put("APRV_SEQ", "2");
				paramMap.put("APLPR_ID", APLPR_ID2);
				paramMap.put("APLPR_NM", APLPR_NM2);
				paramMap.put("APLPR_SCTN_ID", "");
				paramMap.put("APLPR_SCTN_NM", "");
				paramMap.put("APRV_YN", "N");
				paramMap.put("APRV_DT", "");
				paramMap.put("APLPR_OPNN_CTT", "");
				if(iAPRV_STEP_CFY == 2)
					paramMap.put("APRV_TYP", "Y");
				else 
					paramMap.put("APRV_TYP", "N");
				paramMap.put("APLPR_JBPS_NM", "");
				pelsOutcomeService.insert("InsertAplpr2", paramMap);
				
				if(iAPRV_STEP_CFY > 2) {
					paramMap.put("APRV_SEQ", "3");
					paramMap.put("APLPR_ID", APLPR_ID3);
					paramMap.put("APLPR_NM", APLPR_NM3);
					paramMap.put("APLPR_SCTN_ID", "");
					paramMap.put("APLPR_SCTN_NM", "");
					paramMap.put("APRV_YN", "N");
					paramMap.put("APRV_DT", "");
					paramMap.put("APLPR_OPNN_CTT", "");
					if(iAPRV_STEP_CFY == 3)
						paramMap.put("APRV_TYP", "Y");
					else 
						paramMap.put("APRV_TYP", "N");
					paramMap.put("APLPR_JBPS_NM", "");
					pelsOutcomeService.insert("InsertAplpr2", paramMap);
				}
				
				if(iAPRV_STEP_CFY > 3) {
					paramMap.put("APRV_SEQ", "4");
					paramMap.put("APLPR_ID", APLPR_ID4);
					paramMap.put("APLPR_NM", APLPR_NM4);
					paramMap.put("APLPR_SCTN_ID", "");
					paramMap.put("APLPR_SCTN_NM", "");
					paramMap.put("APRV_YN", "N");
					paramMap.put("APRV_DT", "");
					paramMap.put("APLPR_OPNN_CTT", "");
					if(iAPRV_STEP_CFY == 4)
						paramMap.put("APRV_TYP", "Y");
					else 
						paramMap.put("APRV_TYP", "N");
					paramMap.put("APLPR_JBPS_NM", "");
					pelsOutcomeService.insert("InsertAplpr2", paramMap);
				}
				
				
				paramMap.put("PPCD", "");
				paramMap.put("SH_APLPR_ID", APLPR_ID1);
				System.out.println("================================================");
				System.out.println("APLPR_ID1 : " + APLPR_ID1);
				System.out.println("================================================");
				
				Map<String, String> signDetail = pelsOutcomeService.getDetail("SignList", paramMap);
				if(signDetail != null) {
					HashMap paramsMap = new HashMap();
					HttpConnectionUtil HUtil = new HttpConnectionUtil();
					
				    Date nowDate = new Date();
				    
				    SimpleDateFormat format = new SimpleDateFormat("yy/MM/dd");
				    String SignDate = format.format(nowDate);
					
				    paramsMap.put("SIGN_DATE", SignDate);
				    paramsMap.put("APRV_SEQ", "1");
				    paramsMap.put("OZD_NAME", OZD_NAME);
				    paramsMap.put("SIGN_DATA1", signDetail.get("SIGN_DATA1"));
				    if(signDetail.get("SIGN_DATA2") != null)
				    	paramsMap.put("SIGN_DATA2", signDetail.get("SIGN_DATA2"));
				    
				    if(signDetail.get("SIGN_DATA3") != null)
				    	paramsMap.put("SIGN_DATA3", signDetail.get("SIGN_DATA3"));
				    
				    if(signDetail.get("SIGN_DATA4") != null)
				    	paramsMap.put("SIGN_DATA4", signDetail.get("SIGN_DATA4"));
				    
				    if(signDetail.get("SIGN_DATA5") != null)
				    	paramsMap.put("SIGN_DATA5", signDetail.get("SIGN_DATA5"));
				    
				    if(signDetail.get("SIGN_DATA6") != null)
				    	paramsMap.put("SIGN_DATA6", signDetail.get("SIGN_DATA6"));
				    
				    if(signDetail.get("SIGN_DATA7") != null)
					    paramsMap.put("SIGN_DATA7", signDetail.get("SIGN_DATA7"));
				    
				    if(signDetail.get("SIGN_DATA8") != null)
				    	paramsMap.put("SIGN_DATA8", signDetail.get("SIGN_DATA8"));
				    
				    if(signDetail.get("SIGN_DATA9") != null)
				    	paramsMap.put("SIGN_DATA9", signDetail.get("SIGN_DATA9"));
				    
				    if(signDetail.get("SIGN_DATA10") != null)
				    	paramsMap.put("SIGN_DATA10", signDetail.get("SIGN_DATA10"));
				    
				    System.out.println("====================================================================================");
				    System.out.println("OZD_NAME : " + OZD_NAME);
				    System.out.println("OZ_HOME : " + OZ_HOME);
				    System.out.println("SIGN_DATA2 : " +  signDetail.get("SIGN_DATA2"));
				    System.out.println("====================================================================================");

				    String result2 = HUtil.postRequest(OZ_HOME + "/pels/inspection_ozd_sign2.jsp", paramsMap);
				}
				
				
				resultMsg = "등록이 완료되었습니다.";
			}
			else if ("/Aplpr_Delete_Ajax.do".equals(request.getRequestURI())) {
				pelsOutcomeService.delete("DeleteAplpr", paramMap);
				resultMsg = "결재가 회수되었습니다.";
			}
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
	
	/**
	 * 결재선을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Aplpr_Approve_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> aplprApprove (HttpServletRequest request) throws Exception {
		
		String OZ_HOME = utilProperties.getProperty("OZ_HOME");
		//OZ_HOME = "http://localhost:7070/oz80";
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String TST_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""));
		String APRV_SEQ = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_SEQ"), ""));
		String APLPR_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_ID"), ""));
		String OZD_NAME = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("OZD_NAME"), ""));
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("APRV_SEQ", APRV_SEQ);
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			paramMap.put("APLPR_ID", APLPR_ID);
			pelsOutcomeService.insert("UpdateAplprApprove", paramMap);
			
			// 폼에 사인을 넣는다.
			// 사인을 읽어온다.
			paramMap.put("PPCD", "");
			paramMap.put("SH_APLPR_ID", APLPR_ID);
			Map<String, String> signDetail = pelsOutcomeService.getDetail("SignList", paramMap);
			if(signDetail != null) {
				HashMap paramsMap = new HashMap();
				HttpConnectionUtil HUtil = new HttpConnectionUtil();
				
			    Date nowDate = new Date();
			    
			    SimpleDateFormat format = new SimpleDateFormat("yy/MM/dd");
			    String SignDate = format.format(nowDate);
				
			    paramsMap.put("SIGN_DATE", SignDate);
			    paramsMap.put("APRV_SEQ", APRV_SEQ);
			    paramsMap.put("OZD_NAME", OZD_NAME);
			    paramsMap.put("SIGN_DATA1", signDetail.get("SIGN_DATA1"));
			    if(signDetail.get("SIGN_DATA2") != null)
			    	paramsMap.put("SIGN_DATA2", signDetail.get("SIGN_DATA2"));
			    
			    if(signDetail.get("SIGN_DATA3") != null)
			    	paramsMap.put("SIGN_DATA3", signDetail.get("SIGN_DATA3"));
			    
			    if(signDetail.get("SIGN_DATA4") != null)
			    	paramsMap.put("SIGN_DATA4", signDetail.get("SIGN_DATA4"));
			    
			    if(signDetail.get("SIGN_DATA5") != null)
			    	paramsMap.put("SIGN_DATA5", signDetail.get("SIGN_DATA5"));
			    
			    if(signDetail.get("SIGN_DATA6") != null)
			    	paramsMap.put("SIGN_DATA6", signDetail.get("SIGN_DATA6"));
			    
			    if(signDetail.get("SIGN_DATA7") != null)
				    paramsMap.put("SIGN_DATA7", signDetail.get("SIGN_DATA7"));
			    
			    if(signDetail.get("SIGN_DATA8") != null)
			    	paramsMap.put("SIGN_DATA8", signDetail.get("SIGN_DATA8"));
			    
			    if(signDetail.get("SIGN_DATA9") != null)
			    	paramsMap.put("SIGN_DATA9", signDetail.get("SIGN_DATA9"));
			    
			    if(signDetail.get("SIGN_DATA10") != null)
			    	paramsMap.put("SIGN_DATA10", signDetail.get("SIGN_DATA10"));
			    
			    System.out.println("====================================================================================");
			    System.out.println("APRV_SEQ : " + APRV_SEQ);
			    System.out.println("OZD_NAME : " + OZD_NAME);
			    System.out.println("OZ_HOME : " + OZ_HOME);
			    System.out.println("SIGN_DATA2 : " +  signDetail.get("SIGN_DATA2"));
			    System.out.println("====================================================================================");
			    
			    String result2 = HUtil.postRequest(OZ_HOME + "/pels/inspection_ozd_sign2.jsp", paramsMap);
			}
			
			resultMsg = "결재가 완료되었습니다.";
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
	
	/**
	 * 결재선을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Aplpr_Approve2_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> aplprApprove2 (HttpServletRequest request) throws Exception {
		
		String OZ_HOME = utilProperties.getProperty("OZ_HOME");
		//OZ_HOME = "http://localhost:7070/oz80";
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String TST_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""));
		String APRV_SEQ = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_SEQ"), ""));
		String APLPR_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_ID"), ""));
		String APRV_DT = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_DT"), ""));
		String OZD_NAME = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("OZD_NAME"), ""));
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("APRV_SEQ", APRV_SEQ);
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			//paramMap.put("APLPR_ID", APLPR_ID);
			//pelsOutcomeService.insert("UpdateAplprApprove", paramMap);
			
			// 폼에 사인을 넣는다.
			// 사인을 읽어온다.
			paramMap.put("PPCD", "");
			paramMap.put("SH_APLPR_ID", APLPR_ID);
			Map<String, String> signDetail = pelsOutcomeService.getDetail("SignList", paramMap);
			if(signDetail != null) {
				HashMap paramsMap = new HashMap();
				HttpConnectionUtil HUtil = new HttpConnectionUtil();
				
			    Date nowDate = new Date();
			    
			    SimpleDateFormat format = new SimpleDateFormat("yy/MM/dd");
			    String SignDate = format.format(nowDate);
				
			    paramsMap.put("SIGN_DATE", APRV_DT);
			    paramsMap.put("APRV_SEQ", APRV_SEQ);
			    paramsMap.put("OZD_NAME", OZD_NAME);
			    paramsMap.put("SIGN_DATA1", signDetail.get("SIGN_DATA1"));
			    if(signDetail.get("SIGN_DATA2") != null)
			    	paramsMap.put("SIGN_DATA2", signDetail.get("SIGN_DATA2"));
			    
			    if(signDetail.get("SIGN_DATA3") != null)
			    	paramsMap.put("SIGN_DATA3", signDetail.get("SIGN_DATA3"));
			    
			    if(signDetail.get("SIGN_DATA4") != null)
			    	paramsMap.put("SIGN_DATA4", signDetail.get("SIGN_DATA4"));
			    
			    if(signDetail.get("SIGN_DATA5") != null)
			    	paramsMap.put("SIGN_DATA5", signDetail.get("SIGN_DATA5"));
			    
			    if(signDetail.get("SIGN_DATA6") != null)
			    	paramsMap.put("SIGN_DATA6", signDetail.get("SIGN_DATA6"));
			    
			    if(signDetail.get("SIGN_DATA7") != null)
				    paramsMap.put("SIGN_DATA7", signDetail.get("SIGN_DATA7"));
			    
			    if(signDetail.get("SIGN_DATA8") != null)
			    	paramsMap.put("SIGN_DATA8", signDetail.get("SIGN_DATA8"));
			    
			    if(signDetail.get("SIGN_DATA9") != null)
			    	paramsMap.put("SIGN_DATA9", signDetail.get("SIGN_DATA9"));
			    
			    if(signDetail.get("SIGN_DATA10") != null)
			    	paramsMap.put("SIGN_DATA10", signDetail.get("SIGN_DATA10"));
			    
			    System.out.println("====================================================================================");
			    System.out.println("APRV_SEQ : " + APRV_SEQ);
			    System.out.println("OZD_NAME : " + OZD_NAME);
			    System.out.println("OZ_HOME : " + OZ_HOME);
			    System.out.println("SIGN_DATA2 : " +  signDetail.get("SIGN_DATA2"));
			    System.out.println("====================================================================================");
			    
			    String result2 = HUtil.postRequest(OZ_HOME + "/pels/inspection_ozd_sign2.jsp", paramsMap);
			}
			
			resultMsg = "결재가 완료되었습니다.";
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
	
	@RequestMapping(value={"/Aplpr_Approve3_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> aplprApprove3 (HttpServletRequest request) throws Exception {
		
		String OZ_HOME = utilProperties.getProperty("OZ_HOME");
		//OZ_HOME = "http://localhost:7070/oz80";
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String TST_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""));
		String APRV_SEQ = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_SEQ"), ""));
		String APLPR_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APLPR_ID"), ""));
		String APRV_DT = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_DT"), ""));
		String OZD_NAME = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("OZD_NAME"), ""));
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("APRV_SEQ", APRV_SEQ);
		
		String resultMsg = "";
		String resultCd = "false";
	    String Sign_Data = ""; 
		
		try {
			//paramMap.put("APLPR_ID", APLPR_ID);
			//pelsOutcomeService.insert("UpdateAplprApprove", paramMap);
			
			// 폼에 사인을 넣는다.
			// 사인을 읽어온다.
			paramMap.put("PPCD", "");
			paramMap.put("SH_APLPR_ID", APLPR_ID);
			Map<String, String> signDetail = pelsOutcomeService.getDetail("SignList", paramMap);
			if(signDetail != null) {
				HashMap paramsMap = new HashMap();
				HttpConnectionUtil HUtil = new HttpConnectionUtil();
				
			    Date nowDate = new Date();
			    
			    SimpleDateFormat format = new SimpleDateFormat("yy/MM/dd");
			    String SignDate = format.format(nowDate);
				
			    paramsMap.put("SIGN_DATE", APRV_DT);
			    paramsMap.put("APRV_SEQ", APRV_SEQ);
			    paramsMap.put("OZD_NAME", OZD_NAME);
			    
			    Sign_Data = signDetail.get("SIGN_DATA1");
			    
			    paramsMap.put("SIGN_DATA1", signDetail.get("SIGN_DATA1"));
			    if(signDetail.get("SIGN_DATA2") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA2");
			    
			    if(signDetail.get("SIGN_DATA3") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA3");
			    
			    if(signDetail.get("SIGN_DATA4") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA4");
			    
			    if(signDetail.get("SIGN_DATA5") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA5");
			    
			    if(signDetail.get("SIGN_DATA6") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA6");
			    
			    if(signDetail.get("SIGN_DATA7") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA7");
			    
			    if(signDetail.get("SIGN_DATA8") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA8");
			    
			    if(signDetail.get("SIGN_DATA9") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA9");
			    
			    if(signDetail.get("SIGN_DATA10") != null)
			    	Sign_Data += signDetail.get("SIGN_DATA10");
			    
			    System.out.println("====================================================================================");
			    System.out.println("APRV_SEQ : " + APRV_SEQ);
			    System.out.println("OZD_NAME : " + OZD_NAME);
			    System.out.println("OZ_HOME : " + OZ_HOME);
			    System.out.println("SIGN_DATA2 : " +  signDetail.get("SIGN_DATA2"));
			    System.out.println("====================================================================================");
			    
			}
			
			resultMsg = "결재가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("procedureSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("signData", Sign_Data);
		resultMap.put("callMethod", "procedureSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}	
	
	
    private String cleanXSS(String value) {
    	//You'll need to remove the spaces from the html entities below
        value = value.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
        value = value.replaceAll("&#40;", "\\(").replaceAll("&#41;", "\\)");
        value = value.replaceAll("&#39;", "'");
        //value = value.replaceAll("eval\\((.*)\\)", "");
        //value = value.replaceAll("[\\\"\\\'][\\s]*javascript:(.*)[\\\"\\\']", "\"\"");
        //value = value.replaceAll("script", "");
        return value;
    }
}
