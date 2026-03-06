package com.khnp.pels.common.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.util.FileCopyUtils;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.google.gson.JsonObject;
import com.khnp.pels.common.dto.CommonFileDTO;
import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.service.PELSFileLogicService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.xss.JsonXssFilter;
import common.util.*;

@Controller
public class PELSCommonController {
	private static final Logger log = LoggerFactory.getLogger(PELSCommonController.class);

	@Autowired
	private PELSFileLogicService pelsFileLogicService;
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;	

	@Resource(name = "utilProperties")
	private Properties utilProperties;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();	
	
	@RequestMapping(value = "{path}.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView MatchingPath(@PathVariable String path, HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HttpSession session = request.getSession();
		
		if ("/index.do".equals(request.getRequestURI()) && (StringUtil.isNull((String) session.getAttribute("LOGIN_USER_ID")))) {
			mav.setViewName("redirect:LoginSSO.do");
			return mav;
		}
		else if ("/index2.do".equals(request.getRequestURI())) {
			session.setAttribute("LOGIN_USER_ID", "M1EU0004");
			session.setAttribute("LOGIN_USER_NM", "개발자");
			session.setAttribute("LOGIN_DIVS_CD", "333");
			session.setAttribute("LOGIN_PPCD", "3330");
			session.setAttribute("LOGIN_PWPL_CFY", "2");
			session.setAttribute("LOGIN_PPCD_NM", "무주양수발전소");
			session.setAttribute("LOGIN_TYPE_CD", "2");
			
			mav.addObject("LOGIN_USER_NM", "개발자");
			mav.addObject("LOGIN_PPCD_NM", "무주양수발전소");
		}	
		else if ("/index3.do".equals(request.getRequestURI())) {
			session.setAttribute("LOGIN_USER_ID", "M1EU0004");
			session.setAttribute("LOGIN_USER_NM", "개발자");
			session.setAttribute("LOGIN_DIVS_CD", "333");
			session.setAttribute("LOGIN_PPCD", "3330");
			session.setAttribute("LOGIN_PWPL_CFY", "2");
			session.setAttribute("LOGIN_PPCD_NM", "무주양수발전소");
			session.setAttribute("LOGIN_TYPE_CD", "2");
			
			mav.addObject("LOGIN_USER_NM", "개발자");
			mav.addObject("LOGIN_PPCD_NM", "무주양수발전소");
			
			mav.setViewName("/pels/index");
			return mav;
		}	
		mav.setViewName("/pels/" + path);
		

		return mav;
	}
	
	@RequestMapping(value = "Main.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView MainPage(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		
		HttpSession session = request.getSession();

		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("USER_ID", USER_ID);
		
		paramMap.put("CHCK_STRT_DT", "");
		paramMap.put("CHCK_END_DT", "");
		
		paramMap.put("FRM_UNQ_KY_VAL", "");
		paramMap.put("PRCDOC_CFY", "P");
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		paramMap.put("TITL_NM", "");
		
		paramMap.put("PRSTS_CFY", "");
		paramMap.put("PRSTS_CFY_M", "'R', 'A', 'F'");  // 진행상태구분 R:준비, A:허가, F:수행, S:정지, C:완료
		
		paramMap.put("DISPSTART", 1);
		paramMap.put("DISPEND", 8);
		paramMap.put("SH_SORT", "CHCK_STRT_DT");
		
		ArrayList examList1 = (ArrayList) pelsFormService.getList("ExamReadyList", paramMap);
		mav.addObject("examList1", examList1);
	
		paramMap.put("PRCDOC_CFY", "M");
		
		ArrayList examList2 = (ArrayList) pelsFormService.getList("ExamReadyList", paramMap);
		mav.addObject("examList2", examList2);
		
		paramMap.put("GRUP_CFY_CD", "A");
		paramMap.put("BLBR_TITL_NM", "");		
		
		ArrayList boardList1 = (ArrayList) pelsFormService.getList("BoardList", paramMap); // 정주기시험 리스트
		mav.addObject("boardList1", boardList1);

		paramMap.put("GRUP_CFY_CD", "C");

		ArrayList boardList2 = (ArrayList) pelsFormService.getList("BoardList", paramMap); // 정주기시험 리스트
		mav.addObject("boardList2", boardList2);
		
		mav.setViewName("/pels/Main");
		
		return mav;
	}
	
	@RequestMapping(value = "GetPlantCode.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> GetPlantCode(HttpServletRequest request) {
		String PWPL_CFY = request.getParameter("PWPL_CFY");

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("PWPL_CFY", PWPL_CFY);

		List plantCodeList = new ArrayList();
		if (PWPL_CFY.equals("3")) { // 원자력 발전소일때
			plantCodeList = (ArrayList) pelsFormService.getList("GetPlantHead", paramMap);
		} else {
			plantCodeList = (ArrayList) pelsFormService.getList("GetPlantCode", paramMap);
		}

		Map resultMap = new HashMap<String, Object>();
		resultMap.put("plantCodeList", plantCodeList);

		return resultMap;
	}
	
	@RequestMapping(value = "OzrViewer.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView OzrViewer(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		Map<String, String> resultMap = new HashMap<String, String>();
		ArrayList formList  = new ArrayList();
		
		String PELS_URL = utilProperties.getProperty("PELS_URL");

		String ATFL_GRUP_NM = StringUtil.nvl(request.getParameter("ATFL_GRUP_NM"), "");
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String ATFL_PHCL_NM = StringUtil.nvl(request.getParameter("ATFL_PHCL_NM"), "");
		
		if(!"".equals(ATFL_GRUP_NM)) {
			HashMap<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
			Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
			
			String ATFL_PHCL_NM1 = formDetail.get("ATFL_PHCL_NM1");
			String ATFL_PHCL_NM2 = formDetail.get("ATFL_PHCL_NM2");
			String ATFL_PHCL_NM3 = formDetail.get("ATFL_PHCL_NM3");
			String ATFL_PHCL_NM4 = formDetail.get("ATFL_PHCL_NM4");
			String ATFL_PHCL_NM5 = formDetail.get("ATFL_PHCL_NM5");
			
			if(ATFL_PHCL_NM1 != null && !"".equals(ATFL_PHCL_NM1)) formList.add(ATFL_PHCL_NM1);
			if(ATFL_PHCL_NM2 != null && !"".equals(ATFL_PHCL_NM2)) formList.add(ATFL_PHCL_NM2);
			if(ATFL_PHCL_NM3 != null && !"".equals(ATFL_PHCL_NM3)) formList.add(ATFL_PHCL_NM3);
			if(ATFL_PHCL_NM4 != null && !"".equals(ATFL_PHCL_NM4)) formList.add(ATFL_PHCL_NM4);
			if(ATFL_PHCL_NM5 != null && !"".equals(ATFL_PHCL_NM5)) formList.add(ATFL_PHCL_NM5);
		}
		else {
			formList.add(cleanXSS(ATFL_PHCL_NM));
		}
		
		mav.addObject("formList", formList);
		mav.addObject("PELS_URL", PELS_URL);
		mav.setViewName("/pels/popup/OzrViewer");
		
		return mav;
	}	
	
	@RequestMapping(value = "OzdViewer.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView OzdViewer(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		Map<String, String> resultMap = new HashMap<String, String>();
		ArrayList formList  = new ArrayList();
		
		String PELS_URL = utilProperties.getProperty("PELS_URL");
		String PELS_IP_URL = utilProperties.getProperty("PELS_IP_URL");

		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String ATFL_GRUP_NM = StringUtil.nvl(request.getParameter("ATFL_GRUP_NM"), "");
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String ATFL_PHCL_NM = StringUtil.nvl(request.getParameter("ATFL_PHCL_NM"), "");
		String ATFL_PHCL_NM_OZR = StringUtil.nvl(request.getParameter("ATFL_PHCL_NM_OZR"), "");
		String PDF = StringUtil.nvl(request.getParameter("PDF"), "");
		String CFY = StringUtil.nvl(request.getParameter("CFY"), "");
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), "");
		
		if(!"".equals(ATFL_GRUP_NM)) {
			HashMap<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
			Map<String, String> formDetail = pelsFormService.getDetail("FormDetail", paramMap);
			
			String ATFL_PHCL_NM1 = formDetail.get("ATFL_PHCL_NM1");
			String ATFL_PHCL_NM2 = formDetail.get("ATFL_PHCL_NM2");
			String ATFL_PHCL_NM3 = formDetail.get("ATFL_PHCL_NM3");
			String ATFL_PHCL_NM4 = formDetail.get("ATFL_PHCL_NM4");
			String ATFL_PHCL_NM5 = formDetail.get("ATFL_PHCL_NM5");
			
			if(ATFL_PHCL_NM1 != null && !"".equals(ATFL_PHCL_NM1)) formList.add(ATFL_PHCL_NM1);
			if(ATFL_PHCL_NM2 != null && !"".equals(ATFL_PHCL_NM2)) formList.add(ATFL_PHCL_NM2);
			if(ATFL_PHCL_NM3 != null && !"".equals(ATFL_PHCL_NM3)) formList.add(ATFL_PHCL_NM3);
			if(ATFL_PHCL_NM4 != null && !"".equals(ATFL_PHCL_NM4)) formList.add(ATFL_PHCL_NM4);
			if(ATFL_PHCL_NM5 != null && !"".equals(ATFL_PHCL_NM5)) formList.add(ATFL_PHCL_NM5);
		}
		else {
			if(!"".equals(ATFL_PHCL_NM)) {
				formList.add(ATFL_PHCL_NM);
				if(PDF != null && !"".equals(PDF)) {
					formList.add(PDF);
					mav.addObject("DIV", "PDF");
				}
				else if(ATFL_PHCL_NM_OZR != null && !"".equals(ATFL_PHCL_NM_OZR)) {
					formList.add(ATFL_PHCL_NM_OZR);
					mav.addObject("DIV", "OZR");
				}
			}
			else {
				if(!"".equals(TST_UNQ_KY_VAL)) {
					HashMap<String, Object> paramMap = new HashMap<String, Object>();
					paramMap.put("ATFL_GRUP_NM", "GE_PL_CHECK_S");
					paramMap.put("UNQ_NO", TST_UNQ_KY_VAL);
					paramMap.put("ATFL_ID", "");
					List Files = pelsFormService.getList("FileList", paramMap);
					for(int i=0; i<Files.size(); i++) {
						Map<String, String> sFile  = (Map<String, String>)Files.get(i);
						String sTmp = sFile.get("ATFL_GRUP_NM") + "/" + sFile.get("ATFL_PHCL_NM") + "." + sFile.get("ATFL_FEXT_NM");
						formList.add(sTmp);
					}
				}
			}
		}
		
		mav.addObject("PRSTS_CFY", PRSTS_CFY);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("formList", formList);
		mav.addObject("PELS_URL", PELS_URL);
		mav.addObject("PELS_IP_URL", PELS_IP_URL);
		
		if("Monitoring".equals(CFY))
			mav.setViewName("/pels/popup/OzdMonitoring");
		else if("PDF".equals(CFY))
			mav.setViewName("/pels/popup/OzdPdfViewer");
		else 
			mav.setViewName("/pels/popup/OzdViewer");
		
		return mav;
	}		
	
	@RequestMapping(value = "/Ozd_Upload.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, String> Ozd_Upload (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		String sIP = request.getRemoteAddr();
		ModelAndView mav = new ModelAndView();
		
		// 
		// 정주기 		: REGPR_ID, REGPR_NM, DIV, CLASS, TST_UNQ_KY_VAL
		// 작업전회의 	: REGPR_ID, REGPR_NM, DIV(신규:INSERT, 수정:UPDATE), CLASS, TST_UNQ_KY_VAL
		// 점검관리 	: REGPR_ID, REGPR_NM, DIV(신규:INSERT, 수정:UPDATE), CLASS, TST_UNQ_KY_VAL, UNQ_ID
		// 일반양식 	: REGPR_ID, REGPR_NM, DIV(신규:INSERT, 수정:UPDATE), CLASS, UNQ_KY_VAL, FRM_CFY, TITL_NM
		//
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), "2330");
		String REGPR_ID = StringUtil.nvl(request.getParameter("REGPR_ID"), "");
		String REGPR_NM = StringUtil.nvl(request.getParameter("REGPR_NM"), "");
		String DIV = StringUtil.nvl(request.getParameter("DIV"), ""); 							// 구분(INSERT, UPDATE) 
		String CLASS = StringUtil.nvl(request.getParameter("CLASS"), ""); 					 	// 구분(FRM:정주기,JOB:작업전회의,FRM_MNT:점검관리,ETC_FRM:일반양식) 
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "0"); 	// 시험고유번호
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "0"); 	// FORM고유번호	
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""); 	    	// 그외 고유번호
		String UNQ_ID = StringUtil.nvl(request.getParameter("UNQ_ID"), ""); 					// 점검관리 고유ID
		
		String TITL_NM = StringUtil.nvl(request.getParameter("TITL_NM"), ""); 	    			// 제목
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), ""); 					// OCR, PDF
		
		String RMK_NM = StringUtil.nvl(request.getParameter("RMK_NM"), ""); 	    			// 제목
		String CHCK_YN = StringUtil.nvl(request.getParameter("CHCK_YN"), ""); 					// OCR, PDF
		
		// ECAP
		String NOTN_DCR = StringUtil.nvl(request.getParameter("NOTN_DCR"), "");
		String NOTN_CTT = StringUtil.nvl(request.getParameter("NOTN_CTT"), "");
		
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		//List<MultipartFile> getFileList = mReq.getFiles("file");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("callMethod", DIV);
		paramMap.put("PPCD", StringUtil.nvl(PPCD, "2330"));
		paramMap.put("REGPR_ID", StringUtil.nvl(REGPR_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(REGPR_NM, ""));
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		paramMap.put("UNQ_ID", UNQ_ID);
		
		paramMap.put("TITL_NM", TITL_NM);
		paramMap.put("FRM_CFY", FRM_CFY);
		
		paramMap.put("RMK_NM", RMK_NM);
		paramMap.put("CHCK_YN", CHCK_YN);

		switch(CLASS) {
			case "FRM":
				paramMap.put("ATFL_GRUP_NM", AtflGrupNm.CHECK_S);
				paramMap.put("ATFL_TITL_NM1", "정주기시험");
				break;
			case "FRM_MNT":
				paramMap.put("ATFL_GRUP_NM", AtflGrupNm.FRM_MNT_S);
				paramMap.put("ATFL_TITL_NM1", "점검관리");
				break;
			case "JOB":
				paramMap.put("ATFL_GRUP_NM", AtflGrupNm.JOB_S);
				paramMap.put("ATFL_TITL_NM1", "작업전회의");
				break;
			case "ETC_JOB":
				paramMap.put("ATFL_GRUP_NM", AtflGrupNm.ETC_JOB_S);
				paramMap.put("ATFL_TITL_NM1", "작업전회의");
				break;
			case "ETC_FRM":
				paramMap.put("ATFL_GRUP_NM", AtflGrupNm.ETC_FRM_S);
				paramMap.put("ATFL_TITL_NM1", "일반양식");
				break;
		}
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			resultCd = "true";
			switch(CLASS) {
				case "FRM":
					break;
				case "FRM_MNT":
					break;
				case "JOB":
					//HashMap<String, Object> map = new HashMap<String, Object>();
					//map.put("PRSTS_CFY", "F");
					//map.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
					//pelsFormService.update("UpdateCheck_CFY", map);
					break;
			}
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "Ozd_Upload");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;		
	}
	
	@RequestMapping(value="/FileDownload.do")
	public void FileDownload(HttpServletRequest request, HttpServletResponse response) throws Exception 
	{
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");

		String ATFL_PHCL_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("ATFL_PHCL_NM"), ""));
		String ATFL_ORSRC_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("ATFL_ORSRC_NM"), ""));
		
		String FullFileName = PELS_DIR + "/upload/" + ATFL_PHCL_NM;
		
		File file = new File(FullFileName);
		
		response.setContentType("application/otest-stream");
		response.setContentLength((int) file.length());
	
		String OutPut_FileName = URLEncoder.encode(ATFL_ORSRC_NM, "utf-8");
		
		response.setHeader("Content-Disposition", "attachment;fileName=\""+ OutPut_FileName + "\";");
		response.setHeader("Content-Transfer-Encoding", "binary");
		OutputStream out = response.getOutputStream();
		FileInputStream fis = null;
		
		try {
			fis = new FileInputStream(file);
			FileCopyUtils.copy(fis, out);
			
		} finally {
			if(fis != null) try {fis.close();} catch (IOException e) {}
		}
		
		out.flush();
	}
	
	@RequestMapping(value="/OzdPdfDownload.do")
	public void OzdPdfDownload(HttpServletRequest request, HttpServletResponse response) throws Exception 
	{
		String OZ_HOME = utilProperties.getProperty("OZ_HOME");
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");
		
		String FileName = StringUtil.nvl(request.getParameter("FILE_NAME"),"");
		String OzdName = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("OZD_NAME"), ""));
		String PdfName = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PDF_NAME"), ""));
		
		HttpSession session = request.getSession();
		String LOGIN_USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		
		// 변경작업
		HashMap paramsMap = new HashMap();
		HttpConnectionUtil HUtil = new HttpConnectionUtil();
	    paramsMap.put("ozdName", OzdName);
	    paramsMap.put("PdfName", PdfName);
	    paramsMap.put("USER_ID", LOGIN_USER_ID);
	    String result2 = HUtil.postRequest(OZ_HOME + "/pels/ozd_to_pdf.jsp", paramsMap);

		String FullFileName = PELS_DIR + "\\upload\\PDF_DOWN\\" + LOGIN_USER_ID + "_pdf_result.pdf";
		
		File file = new File(FullFileName);
		
		response.setContentType("application/otest-stream");
		response.setContentLength((int) file.length());
	
		String OutPut_FileName = URLEncoder.encode(FileName, "utf-8");
		
		response.setHeader("Content-Disposition", "attachment;fileName=\""+ OutPut_FileName + "\";");
		response.setHeader("Content-Transfer-Encoding", "binary");
		OutputStream out = response.getOutputStream();
		FileInputStream fis = null;
		
		try {
			fis = new FileInputStream(file);
			FileCopyUtils.copy(fis, out);
			
		} finally {
			if(fis != null) try {fis.close();} catch (IOException e) {}
		}
		
		out.flush();
	}
	
	
	@RequestMapping(value = "User_Popup.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView UserPopup(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String WMSS_URL = utilProperties.getProperty("WMSS_URL");
		String SEARCH_TEXT = StringUtil.nvl(request.getParameter("SEARCH_TEXT"), "");
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), "");
		String PAGE = StringUtil.nvl(request.getParameter("PAGE"), "1");
		String STARTPAGE = StringUtil.nvl(request.getParameter("STARTPAGE"), "1");
		String ENDPAGE = StringUtil.nvl(request.getParameter("ENDPAGE"), "10");
		String LISTCNT = StringUtil.nvl(request.getParameter("LISTCNT"), "10");
		
		HashMap paramsMap = new HashMap();
		HttpConnectionUtil HUtil = new HttpConnectionUtil();
	    paramsMap.put("PPCD", PPCD);
	    paramsMap.put("SEARCH_TEXT", SEARCH_TEXT);
	    paramsMap.put("PAGE", PAGE);
	    paramsMap.put("STARTPAGE", STARTPAGE);
	    paramsMap.put("ENDPAGE", ENDPAGE);
	    paramsMap.put("LISTCNT", LISTCNT);
	    
	    String TCNT = "";
		
	    String result = HUtil.postRequest(WMSS_URL + "/User_Popup.do", paramsMap);	

	    JSONParser parser = new JSONParser();
	    JSONArray jsonArr = null;
	    try {
		    Object obj = parser.parse(result);
		    JSONObject jsonMain = (JSONObject) obj;
		    TCNT = jsonMain.get("TCNT").toString();
		    
		    PAGE = jsonMain.get("PAGE").toString();
		    STARTPAGE = jsonMain.get("STARTPAGE").toString();
		    ENDPAGE = jsonMain.get("ENDPAGE").toString();
		    LISTCNT = jsonMain.get("LISTCNT").toString();
		    jsonArr = (JSONArray)jsonMain.get("userList");
	    }
	    catch(Exception ex) {
	    }
	    
	    paramsMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsFormService.getList("GetPlantCode", paramsMap);
		
		mav.addObject("PPCD", PPCD);
		mav.addObject("SEARCH_TEXT", SEARCH_TEXT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		mav.addObject("TCNT", TCNT);
		mav.addObject("userList", jsonArr);
		mav.addObject("jsonArray", jsonArr);
		mav.addObject("plantList", plantList);
		
		mav.setViewName("/pels/popup/User_Popup");
		
		return mav;
	}
	
	/**
	 * 모바일에서 FormId 관련 값을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Message_Result_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Message_Result_M (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String TST_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""));
		String FRM_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_CFY"), ""));
		String RELTN_SCTN_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("RELTN_SCTN_NM"), ""));
		String MSG_CTT = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("MSG_CTT"), ""));
		String REGPR_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_ID"), "")); 			
		String REGPR_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_NM"), "")); 			
		
		String resultMsg = "";
		String resultCd = "false";
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_CFY", FRM_CFY);
		paramMap.put("RELTN_SCTN_NM", RELTN_SCTN_NM);
		paramMap.put("MSG_CTT", MSG_CTT);
		paramMap.put("REGPR_ID", REGPR_ID);
		paramMap.put("REGPR_NM", REGPR_NM);
		try {
			pelsFormService.insert("InsertMessage", paramMap);

			resultMsg = "저장이 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("Message_Result_M error > {}", e.getMessage(), e);
		}			
		
		resultMap.put("callMethod", "Message_Result_M");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 모바일에서 FormId 관련 값을 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	
	@RequestMapping(value= {"/Message_Search_M.do" }, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView formPopupSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
	
		String TST_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""));
		String FRM_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_CFY"), ""));
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_CFY", FRM_CFY);
		
		ArrayList MessageList = (ArrayList) pelsFormService.getList("MessageList", paramMap);
		HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
		paramMap2.put("MessageList", MessageList);
		org.json.JSONObject JSONDATA = new org.json.JSONObject(paramMap2);
		mav.addObject("JSONDATA", JSONDATA);
		
		mav.setViewName("/pels/Json");
		
		return mav;

	}	
	
	@RequestMapping(value = "OzReport.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView OzReport(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("PRSTS_CFY", "A");
		
		mav.setViewName("/pels/popup/OzReport");
		
		return mav;
	}
	
	/**
	 * Object 를 Array 로 반환 (Map 일 경우 List 안에 추가하여 return)
	 * Null 일 경우 빈 Array 반환
	 * @param obj
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> objectToArray(Object obj) {
		List<Map<String, Object>> selectList = new ArrayList<Map<String, Object>>();
		
		if (obj != null) {
			if (Map.class.isInstance(obj)) {
				selectList.add((Map<String, Object>) obj);
			} else if (ArrayList.class.isInstance(obj)) {
				selectList = (List<Map<String, Object>>) obj;
			}
		}
		
		return selectList;
	}	
	
	/**
	 * Request Body 의 데이터를 JSON(Map) 으로 파싱 
	 * @param request
	 * @return
	 */
	public Map<String, Object> requestBodyJson(HttpServletRequest request) {
		String requestBody = "";
		StringBuilder stringBuilder = new StringBuilder();
		BufferedReader reader = null;
		String line = "";

		try {
			InputStream inputStream = request.getInputStream();
			if (inputStream != null) {
				reader = new BufferedReader(new InputStreamReader(inputStream));
				while ((line = reader.readLine()) != null) {
					stringBuilder.append(line);
				}
			}

			requestBody = stringBuilder.toString();

		} catch (IOException e) {
			e.printStackTrace();
		}

		try {
			JSONParser jsonParser = new JSONParser();
			JSONObject jsonObject = null;

			jsonObject = (JSONObject) jsonParser.parse(requestBody);
			
			return jsonObject;
		} catch (ParseException e) {
			return new HashMap<String, Object>();
		}
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
