package com.khnp.pels.exam.controller;

import java.io.BufferedReader;

import java.io.File;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.sql.Clob;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.json.JSONObject;
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
import com.khnp.pels.exam.service.PELSExamService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.util.ExcelUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.Loader;

import org.springframework.web.bind.annotation.*;
 

import org.apache.pdfbox.io.MemoryUsageSetting;

import java.io.IOException;
import com.khnp.pels.exam.dto.PdfInfo;
import com.khnp.pels.exam.dto.PdfJson;
import com.khnp.pels.exam.dto.PdfPage;

@Controller
public class PELSExamController {

	private static final Logger log = LoggerFactory.getLogger(PELSExamController.class);
	
	@Autowired
	private PELSExamService pelsExamService;
	
	@Autowired
	private PELSFormService pelsFormService;

	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	@Resource(name = "utilProperties")
	private Properties utilProperties;	
	
	private String URL = "http://211.248.231.206:18080";

	/**
	 * 시험(점검)관리 > 시험(점검)준비
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView examSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));			
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String nowDateString = LocalDate.now().format(formatter).replaceAll("-", "");
		
		paramMap.put("CHCK_STRT_DT", ""); // 일단 전체 조회
		paramMap.put("CHCK_END_DT", "");
		//paramMap.put("CHCK_END_DT", nowDateString);
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), ""); 
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		
		paramMap.put("PRSTS_CFY", "");
		paramMap.put("PRSTS_CFY_M", "'R', 'A'");
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		int TCNT = pelsExamService.getCount("ExamReadyCount", paramMap); // 총 조회수
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
		
		ArrayList examList = (ArrayList) pelsExamService.getList("ExamReadyList", paramMap);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsExamService.getList("GetPlantCode", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("plantList", plantList);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("examList", examList);
		mav.setViewName("/pels/exam/Exam_Search");
		
		return mav;
	}
	
	
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView examInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String CHKPR_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String CHKPR_FNM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		
		// 시험시작, 종료일자 초기세팅
		String nowDateString = LocalDate.now().format(formatter);
		
		mav.addObject("CHCK_STRT_DT", nowDateString);
		mav.addObject("CHCK_END_DT", nowDateString);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("CHKPR_ID", CHKPR_ID);
		mav.addObject("CHKPR_FNM", CHKPR_FNM);
		
		mav.setViewName("/pels/exam/Exam_Input_" + PRCDOC_CFY);
		
		return mav;
	}
	
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_Ozd_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_Ozd_Input (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); // 시험고유키값
		
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		
		mav.setViewName("/pels/exam/Exam_Ozd_Input");
		
		return mav;
	}	
	





	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView examDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String USER_DEPT_NM = (String) session.getAttribute("LOGIN_USER_DEPT_NM");
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		// 시험점검이력정보(GE_MP_CHECK_S) 조회
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		Map<String, String> examDetail = pelsExamService.getDetail("ExamDetail", paramMap);
		
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		
		mav.addObject("examDetail", examDetail);
		
		mav.setViewName("/pels/exam/Exam_Detail_" + PRCDOC_CFY);
		return mav;
	}
	
	
	public static String clobToString(Clob clob) throws Exception {
	    if (clob == null) return null;

	    StringBuilder sb = new StringBuilder();
	    try (Reader reader = clob.getCharacterStream();
	         BufferedReader br = new BufferedReader(reader)) {

	        char[] buffer = new char[8192]; // 8KB
	        int length;
	        while ((length = br.read(buffer)) != -1) {
	            sb.append(buffer, 0, length);
	        }
	    }
	    
	    return sb.toString();
	}

	/**
	 * 시험(점검)준비를 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Exam_Insert_Ajax.do", "/Exam_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> examSave (HttpServletRequest request) throws Exception {
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");
		String PELS_IP_URL = utilProperties.getProperty("PELS_IP_URL");
		
		
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String USER_DEPT_NM = (String) session.getAttribute("LOGIN_USER_DEPT_NM");
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); // 시험고유키값
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		
		String CHCK_STRT_DT = StringUtil.nvl(request.getParameter("CHCK_STRT_DT"), ""); // 점검시작일자
		String CHCK_END_DT = StringUtil.nvl(request.getParameter("CHCK_END_DT"), ""); 		// 점검종료일자
		
		CHCK_STRT_DT = CHCK_STRT_DT.replaceAll("-", "");
		CHCK_END_DT = CHCK_END_DT.replaceAll("-", "");
		
		String TITL_NM = StringUtil.nvl(request.getParameter("TITL_NM"), ""); 			// 제목명
		String WRKOR_NO = StringUtil.nvl(request.getParameter("WRKOR_NO"), ""); 		// 작업오더번호
		String ATWT_PPL_CNT = StringUtil.nvl(request.getParameter("ATWT_PPL_CNT"), ""); // 입회인원수
		String ATWT_RQST_YN = StringUtil.nvl(request.getParameter("ATWT_RQST_YN"), ""); // 입회요청여부
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), ""); 		// 진행상태구분
		String CHKPR_ID = StringUtil.nvl(request.getParameter("CHKPR_ID"), ""); 		// 점검자ID
		String CHKPR_FNM = StringUtil.nvl(request.getParameter("CHKPR_FNM"), ""); 		// 점검자명
		String CNMR_ID = StringUtil.nvl(request.getParameter("CNMR_ID"), ""); 			// 확인자ID
		String CNMR_FNM = StringUtil.nvl(request.getParameter("CNMR_FNM"), ""); 		// 학인자명
		String ATWT_ID = StringUtil.nvl(request.getParameter("ATWT_ID"), ""); 			// 확인자ID
		String ATWT_FNM = StringUtil.nvl(request.getParameter("ATWT_FNM"), ""); 		// 학인자명
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), ""); 		// 학인자명

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT);
		paramMap.put("CHCK_END_DT", CHCK_END_DT);
		
		paramMap.put("TITL_NM", TITL_NM);
		paramMap.put("CHKPR_ID", CHKPR_ID);
		paramMap.put("CHKPR_FNM", CHKPR_FNM);
		paramMap.put("WRKOR_NO", WRKOR_NO);
		paramMap.put("ATWT_PPL_CNT", ATWT_PPL_CNT);
		paramMap.put("ATWT_RQST_YN", ATWT_RQST_YN);
		paramMap.put("PRSTS_CFY", PRSTS_CFY);
		
		paramMap.put("CNMR_ID", CNMR_ID);
		paramMap.put("CNMR_FNM", CNMR_FNM);
		paramMap.put("ATWT_ID", ATWT_ID);
		paramMap.put("ATWT_FNM", ATWT_FNM);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		// 그룹명
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.CHECK_S);

		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;	
		System.out.println("mReq = " + mReq);
		String resultMsg = "";
		String resultCd = "false";
		
		if ("/Exam_Insert_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "INSERT");
		}
		else if ("/Exam_Update_Ajax.do".equals(uri)) {
			paramMap.put("callMethod", "UPDATE");
		}
		
		try {
			TST_UNQ_KY_VAL = pelsExamService.getLastUnqKey("ExamLastUnqNo");
			
			resultMsg = pelsFormLogicService.formSave(paramMap, mReq);
			if ("/Exam_Insert_Ajax.do".equals(request.getRequestURI())) {
				
				// JSON 복사
				paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
				Map<String, String> MapTemp =  pelsFormService.getDetail("ExamDetail", paramMap);
				
				System.out.println("===============================================================");
				System.out.println("PDF_PATH = " + MapTemp.get("ATFL_PHCL_NM1"));
				System.out.println("===============================================================");
				File file = new File(PELS_DIR + "\\upload\\" + MapTemp.get("ATFL_PHCL_NM1"));
				
				List<PdfPage> pages = new ArrayList<>();
				int canvasWidth = 720;
				int canvasHeight = 1020;
				 
				try (PDDocument document = Loader.loadPDF(file)) {

				    int pageCount = document.getNumberOfPages();
				    System.out.println("pageCount = " + pageCount);

				    for (int i = 0; i < pageCount; i++) {
		                PDPage page = document.getPage(i);
		                PDRectangle mediaBox = page.getMediaBox();

		                float widthPt = mediaBox.getWidth();
		                float heightPt = mediaBox.getHeight();

		                // Canvas 기준 비율
		                float scale = canvasWidth / widthPt;
		                int width = (int)(widthPt * scale);
		                int height = (int)(heightPt * scale);

		                // 가로 페이지일 경우 Canvas 방향 바꾸기
		                if (width > height) {
		                    width = canvasHeight;
		                    height = canvasWidth;
		                }
		                else
		                {
		                    width = canvasWidth;
		                    height = canvasHeight;
		                }
				        
				        PdfPage pdfPage = new PdfPage(
		                        i + 1,
		                        i + 1,
		                        width,
		                        height,
		                        i == 0 ? "Y" : "N",
		                        new ArrayList<>()
		                );
		                pages.add(pdfPage);

				    }
				    
		            PdfInfo pdfInfo = new PdfInfo(pageCount, canvasWidth, canvasHeight);
		            String creationDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

		            PdfJson pdfJson = new PdfJson(creationDate, USER_ID, USER_DEPT_NM, pdfInfo, pages);

		            // ObjectMapper로 JSON 문자열 생성
		            ObjectMapper mapper = new ObjectMapper();
		            
		            String jsonString = mapper.writerWithDefaultPrettyPrinter()
		                    .writeValueAsString(pdfJson);

			        System.out.println("==========================================================");
			        System.out.println(jsonString);
					paramMap.put("FRM_OVER_JSON", jsonString);
					paramMap.put("FRM_CONS_JSON", "");
					paramMap.put("ATFL_PHCL_NM",  MapTemp.get("ATFL_PHCL_NM1"));
					paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
					paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));

			        pelsExamService.insert("InsertCheckJson", paramMap);
			        
			        
				}
				resultMsg = "저장이 완료되었습니다.";
			}
			else if ("/Exam_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsExamService.update("UpdateExam", paramMap);
				resultMsg = "저장이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("examSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "examSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	@RequestMapping(value= {"/Exam_Insert_M.do", "Exam_Update_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_Insert_M (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); // 시험고유키값
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), ""); // 시험고유키값
				
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); // 시험고유키값
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		String CHCK_STRT_DT = StringUtil.nvl(request.getParameter("CHCK_STRT_DT"), ""); 	// 점검시작일자
		String CHCK_END_DT = StringUtil.nvl(request.getParameter("CHCK_END_DT"), ""); 		// 점검종료일자
		
		CHCK_STRT_DT = CHCK_STRT_DT.replaceAll("-", "");
		CHCK_END_DT = CHCK_END_DT.replaceAll("-", "");
		
		String TITL_NM = StringUtil.nvl(request.getParameter("TITL_NM"), ""); 			// 제목명
		String WRKOR_NO = StringUtil.nvl(request.getParameter("WRKOR_NO"), ""); 		// 작업오더번호
		String ATWT_PPL_CNT = StringUtil.nvl(request.getParameter("ATWT_PPL_CNT"), ""); // 입회인원수
		String ATWT_RQST_YN = StringUtil.nvl(request.getParameter("ATWT_RQST_YN"), ""); // 입회요청여부
		String PRSTS_CFY = "A";
		String CHKPR_ID = StringUtil.nvl(request.getParameter("CHKPR_ID"), ""); 		// 점검자ID
		String CHKPR_FNM = StringUtil.nvl(request.getParameter("CHKPR_FNM"), ""); 		// 점검자명
		String CNMR_ID = StringUtil.nvl(request.getParameter("CNMR_ID"), ""); 			// 확인자ID
		String CNMR_FNM = StringUtil.nvl(request.getParameter("CNMR_FNM"), ""); 		// 학인자명
		String ATWT_ID = StringUtil.nvl(request.getParameter("ATWT_ID"), ""); 			// 확인자ID
		String ATWT_FNM = StringUtil.nvl(request.getParameter("ATWT_FNM"), ""); 		// 학인자명
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT);
		paramMap.put("CHCK_END_DT", CHCK_END_DT);
		
		paramMap.put("TITL_NM", TITL_NM);
		paramMap.put("CHKPR_ID", CHKPR_ID);
		paramMap.put("CHKPR_FNM", CHKPR_FNM);
		paramMap.put("WRKOR_NO", WRKOR_NO);
		paramMap.put("ATWT_PPL_CNT", ATWT_PPL_CNT);
		paramMap.put("ATWT_RQST_YN", ATWT_RQST_YN);
		paramMap.put("PRSTS_CFY", PRSTS_CFY);
		
		paramMap.put("CNMR_ID", CNMR_ID);
		paramMap.put("CNMR_FNM", CNMR_FNM);
		paramMap.put("ATWT_ID", ATWT_ID);
		paramMap.put("ATWT_FNM", ATWT_FNM);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Exam_Insert_M.do".equals(request.getRequestURI())) {
				TST_UNQ_KY_VAL = pelsExamService.getLastUnqKey("ExamLastUnqNo");
				paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
				
				pelsExamService.insert("InsertExam", paramMap);

				System.out.println("===================================================");
				System.out.println("FRM_UNQ_KY_VAL = " + FRM_UNQ_KY_VAL);
				System.out.println("===================================================");
				
				resultMsg = "저장이 완료되었습니다.";
			}
			else if ("/Exam_Update_M.do".equals(request.getRequestURI())) {
				pelsExamService.update("UpdateExam", paramMap);
				resultMsg = "저장이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("examSave error > {}", e.getMessage(), e);
		}
		
		ArrayList examList = (ArrayList) pelsExamService.getList("ExamMaxData", paramMap);
		
		HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
		paramMap2.put("examList", examList);
		JSONObject JSONDATA = new JSONObject(paramMap2);
		mav.addObject("JSONDATA", JSONDATA);
		mav.setViewName("/pels/Json");

		return mav;
	}
	

	/**
	 * 선택된 시험(점검)준비를 삭제한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> examDelete (HttpServletRequest request) {
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");

		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = StringUtil.nvl(request.getParameter("CHK_ITEM"), "");
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		map.put("REGPR_ID", USER_ID);
		map.put("REGPR_NM", USER_NM);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			//resultCnt = pelsExamService.delete("DeleteExam", map);	
			resultCnt = pelsExamService.update("DeleteExam", map);
			
			map.put("ATFL_GRUP_NM", "GE_PL_CHECK_S");
			pelsExamService.update("DeleteFiles", map);
			//pelsExamService.delete("DeleteFiles", map);
			
			resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "삭제에 실패하였습니다.";
			log.error("examDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "examDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 시험(점검)관리 > 시험(점검)수행 모니터링
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_Monitoring.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView examMonitoring (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		//String nowDateString = LocalDate.now().format(formatter).replaceAll("-", "");
		String nowDateString = "";
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));			
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), ""); 

		paramMap.put("CHCK_STRT_DT", nowDateString);
		paramMap.put("CHCK_END_DT", nowDateString);
		
		String SH_FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("SH_FRM_UNQ_KY_VAL"), ""); 
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String SH_SORT = StringUtil.nvl(request.getParameter("SH_SORT"), "CHCK_STRT_DT");
		
		paramMap.put("FRM_UNQ_KY_VAL", SH_FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("PRCDOC_NM", SH_PRCDOC_NM);
		paramMap.put("TITL_NM", SH_TITL_NM);
		paramMap.put("SH_SORT", SH_SORT);
		
		paramMap.put("PRSTS_CFY", "");
		paramMap.put("PRSTS_CFY_M", "'R', 'A', 'F'");  // 진행상태구분 R:준비, A:허가, F:수행, S:정지, C:완료
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsExamService.getCount("ExamReadyCount", paramMap); // 총 조회수
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
		
		ArrayList examList = (ArrayList) pelsExamService.getList("ExamReadyList", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("examList", examList);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsExamService.getList("GetPlantCode", paramMap);

		paramMap.clear();
		paramMap.put("PRCDOC_CFY", "M");
		paramMap.put("PRCDOC_NO", ""); 				// 절차서번호
		paramMap.put("PRCDOC_NM", ""); 				// 절차서명
		paramMap.put("DISPSTART", 1);
		paramMap.put("DISPEND", 200);
		ArrayList formList = (ArrayList) pelsFormService.getList("FormList", paramMap);

		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);		
		mav.addObject("SH_PRCDOC_NM", SH_PRCDOC_NM);		
		mav.addObject("SH_TITL_NM", SH_TITL_NM);		
		mav.addObject("SH_FRM_UNQ_KY_VAL", SH_FRM_UNQ_KY_VAL);
		mav.addObject("SH_SORT", SH_SORT);		

		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);		
		mav.addObject("plantList", plantList);
		mav.addObject("formList", formList);
		
		mav.setViewName("/pels/exam/Exam_Monitoring_" + PRCDOC_CFY);
			
		return mav;
	}
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_Search_M (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String nowDateString = LocalDate.now().format(formatter).replaceAll("-", "");
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));			
		
		paramMap.put("CHCK_STRT_DT", ""); // 일단 전체 조회
		paramMap.put("CHCK_END_DT", "");
		//paramMap.put("CHCK_END_DT", nowDateString);
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), ""); 
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String PRSTS_CFY_M = StringUtil.nvl(request.getParameter("PRSTS_CFY_M"), "");
		
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		paramMap.put("TITL_NM", "");
		paramMap.put("SH_SORT", "CHCK_STRT_DT");
		
		//paramMap.put("PRSTS_CFY", PrstsCfy.READY.getCode()); 	// 진행상태구분 R:준비, A:허가 F:수행, S:불만족, C:완료, X:불만족완료
		paramMap.put("PRSTS_CFY", "");
		if(!"".equals(PRSTS_CFY_M)) {
			String[] CFY_TEMP = PRSTS_CFY_M.split("\\,");
			PRSTS_CFY_M = "";
			for(int i=0; i<CFY_TEMP.length; i++) {
				if(i > 0) PRSTS_CFY_M += ",";
				PRSTS_CFY_M += "'" + CFY_TEMP[i] + "'";
			}
		}
		
		paramMap.put("PRSTS_CFY_M", PRSTS_CFY_M);
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsExamService.getCount("ExamReadyCount", paramMap); // 총 조회수
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
		
		ArrayList examList = (ArrayList) pelsExamService.getList("ExamReadyList", paramMap);
		
		if ("/Exam_Search_M.do".equals(request.getRequestURI())) {
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("examList", examList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			mav.addObject("TCNT", TCNT);
			mav.addObject("examList", examList);
			mav.setViewName("/pels/exam/Exam_Search");
		}
		
		return mav;
	}	
	
	
	/**
	 * 시험상태 저장(_M, PC 같이처리
	 * @param request
	 * @return
	 * @throws ServletException 
	 */
	@RequestMapping(value={"/Exam_CFY_Update.do", "/Exam_CFY_Update_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Exam_CFY_Update (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String REGPR_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_ID"), ""));
		String REGPR_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_NM"), ""));
		String TST_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""));
		String PRSTS_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRSTS_CFY"), ""));
		String FRM_PAGE_NO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_PAGE_NO"), ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		if(!"".equals(PRSTS_CFY) && !"".equals(TST_UNQ_KY_VAL)) {
			try {
				HashMap<String, Object> map = new HashMap<String, Object>();
				map.put("PRSTS_CFY", PRSTS_CFY);
				map.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		
				pelsFormService.update("UpdateCheck_CFY", map);
				
				// PRSTS_CFY : 'S' 일경우 이력에 저장할것
				if("S".equals(PRSTS_CFY)) {
					map.put("REGPR_ID", REGPR_ID);
					map.put("REGPR_NM", REGPR_NM);
					map.put("FRM_PAGE_NO", FRM_PAGE_NO);
					
					pelsFormService.delete("DeletePrsts", map);
					pelsFormService.insert("InsertPrsts", map);
				}
				
				resultCd = "true";
			} catch(Exception e) {
				resultMsg = "저장에 실패하였습니다.";
				log.error("formSave error > {}", e.getMessage(), e);
			}
		}
		
		resultMap.put("callMethod", "Exam_CFY_Update");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	@RequestMapping("/Exam_Excel.do")
	@ResponseBody
	public byte[] downExcelFile (HttpServletRequest request, HttpServletResponse response) throws UnsupportedEncodingException {
		String format = "yyyyMMddHHmmss";
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		Calendar c = Calendar.getInstance();
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		String SH_FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("SH_FRM_UNQ_KY_VAL"), ""); 
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String SH_SORT = StringUtil.nvl(request.getParameter("SH_SORT"), "CHCK_STRT_DT");
		
		
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("PRCDOC_NM", SH_PRCDOC_NM);
		paramMap.put("TITL_NM", SH_TITL_NM);
		paramMap.put("SH_SORT", SH_SORT);
		paramMap.put("PRSTS_CFY", "");
		paramMap.put("PRSTS_CFY_M", "'R', 'A', 'F'");  // 진행상태구분 R:준비, A:허가, F:수행, S:정지, C:완료
		
		paramMap.put("CHCK_STRT_DT", "");
		paramMap.put("CHCK_END_DT", "");	
		
		List exList = new ArrayList();
		exList = pelsExamService.getList("ExamList_Excel", paramMap);
		
		List<Object> header = new ArrayList<Object>();
		List<List<Object>> data = new ArrayList<List<Object>>();
		
		for (int i = 0; i < exList.size(); i++){	
	    	HashMap<String, Object> map = (HashMap<String, Object>) exList.get(i);
    	
	    	Iterator iterator = map.keySet().iterator();
    		List<Object> obj = new ArrayList<Object>();	
    		
	    	//header setting 
	    	if (i == 0) {
		    	while (iterator.hasNext()){
		    		String key = (String) iterator.next();
		    		obj.add(String.valueOf(map.get(key)));			    		
		    	}	
	    	} else {
		    	//data setting 
		    	while(iterator.hasNext()){
		    		String key = (String) iterator.next();
		    		obj.add(String.valueOf(map.get(key)));
		    	}
	    	}
	    	
    		data.add(obj);
	    }
		
		String sSheetName = "";
		List<Integer> arrWidth = new ArrayList<Integer>();
		
		if("P".equals(PRCDOC_CFY)) {
			sSheetName = "정주기시험 준비수행";
			arrWidth.add(6000);
			arrWidth.add(6000);
			arrWidth.add(20000);
			arrWidth.add(15000);
			arrWidth.add(4000);
			arrWidth.add(3000);
			arrWidth.add(4000);
			arrWidth.add(4000);
			
		    header.add("시험기간");
		    header.add("절차서번호");
		    header.add("절차서명");
		    header.add("시험명");
		    header.add("점검자");
		    header.add("상태");
		    header.add("등록자");
		    header.add("등록일");
		}
		else {
			sSheetName = "정검지A_점검계획수립";
			
			arrWidth.add(6000);
			arrWidth.add(6000);
			arrWidth.add(20000);
			arrWidth.add(15000);
			arrWidth.add(15000);
			arrWidth.add(4000);
			arrWidth.add(4000);
			arrWidth.add(4000);
			
		    header.add("시험기간");
		    header.add("절차서번호");
		    header.add("절차서명");
		    header.add("점검지명");
		    header.add("점검명");
		    header.add("점검자");
		    header.add("등록자");
		    header.add("등록일");
		}
		
		System.out.println("header = " + header);
		ExcelUtil excel = new ExcelUtil(header ,data);
		excel.setSheetName(sSheetName);
		excel.setWidth(6000);
		excel.setmArrWidth(arrWidth);
		
		byte[] bytes = excel.makeExcel();
		
        String userAgent = request.getHeader("User-Agent");
        boolean br = userAgent.indexOf("Chrome") > -1;
        
        String fileName = null;
        	   fileName = sSheetName + "_" + sdf.format(c.getTime());
        String docName ="";        	   
        
        if(br){
        	docName = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
        } else {
        	docName = URLEncoder.encode(fileName,"UTF-8").replaceAll("\\+", "%20");
        }
		
		response.setHeader("Content-Disposition", "attachment; filename="+docName+".xlsx");
		response.setContentLength(bytes.length);
		response.setContentType("application/vnd.ms-excel");
		response.setHeader("Pragma", "no-cache");		
		response.setHeader("Cache-Control", "private");		
		response.setHeader("Expires", "0");
			
		return bytes;
	}
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_Json_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_Json_M (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String PELS_IP_URL = utilProperties.getProperty("PELS_IP_URL");
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); 
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		
		Map<String, String> MapTemp =  pelsFormService.getDetail("ExamJsonDetail", paramMap);
		
		HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
		paramMap2.put("PDF_PATH", PELS_IP_URL + "/upload/" + MapTemp.get("ATFL_PHCL_NM"));
		
		Object clobObj = MapTemp.get("FRM_OVER_JSON");
		String json = "";
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMap2.put("FRM_OVER_JSON", json);
		
		clobObj = MapTemp.get("FRM_CONS_JSON");
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMap2.put("FRM_CONS_JSON", json);
		
		JSONObject JSONDATA = new JSONObject(paramMap2);
		mav.addObject("JSONDATA", JSONDATA);
		mav.setViewName("/pels/Json");
		
		return mav;
	}
	
	@RequestMapping(value={"/CheckJsonSave_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formJsonSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		String resultMsg = "저장 되었습니다.";
		String resultCd = "false";
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), "");
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), "");
		String FRM_OVER_JSON = StringUtil.nvl(request.getParameter("FRM_OVER_JSON"), "");
		String FRM_CONS_JSON = StringUtil.nvl(request.getParameter("FRM_CONS_JSON"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap.clear();
			paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
			paramMap.put("REGPR_ID", USER_ID);
			paramMap.put("REGPR_NM", USER_NM);
			paramMap.put("FRM_OVER_JSON", FRM_OVER_JSON);
			paramMap.put("FRM_CONS_JSON", FRM_CONS_JSON);
				
			pelsExamService.update("UpdateExamJson", paramMap);
			
			resultCd = "true";
		} 
		catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "CheckJsonSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}	
	
	/**
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/KhnpViewer.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Khnp_Viewer (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		System.out.println("========================================================================");
		System.out.println("USER_ID : " + USER_ID);
		System.out.println("========================================================================");
		
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
			
		mav.setViewName("/pels/popup/KhnpViewer");
		
		return mav;
	}	
	
	/**
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_KhnpViewer.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_KhnpViewer (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		System.out.println("========================================================================");
		System.out.println("USER_ID : " + USER_ID);
		System.out.println("========================================================================");
		
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		String TITL_NM = StringUtil.nvl(request.getParameter("TITL_NM"), "");
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("TITL_NM", TITL_NM);
			
		mav.setViewName("/pels/exam/Exam_KhnpViewer");
		
		return mav;
	}
	
	/* 추가시작 */
	@RequestMapping(value = "/api/Exam_Json_M", method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
	@ResponseBody
	public Map<String, Object> Exam_Json_M_API(HttpServletRequest request) throws Exception {

		String PELS_IP_URL = utilProperties.getProperty("PELS_IP_URL");

		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");

		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");

		Map<String, Object> result = new HashMap<>();
		result.put("USER_ID", USER_ID);
		result.put("USER_NM", USER_NM);

		if ("".equals(TST_UNQ_KY_VAL)) {
			return result;
		}

		/*
		 * ========================= 1. 시험 기본 정보 조회 =========================
		 */
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		
		Map<String, String> mapTemp = pelsFormService.getDetail("ExamJsonDetail", paramMap);
		
		if (mapTemp == null) {
			return result;
		}

		/*
		 * ========================= 2. PDF 경로 =========================
		 */
		result.put("PDF_PATH", PELS_IP_URL + "/upload/" + mapTemp.get("ATFL_PHCL_NM"));

		/*
		 * ========================= 3. Overlay JSON =========================
		 */
		Object overClob = mapTemp.get("FRM_OVER_JSON");
		if (overClob instanceof Clob) {
			result.put("FRM_OVER_JSON", clobToString((Clob) overClob));
		} else {
			result.put("FRM_OVER_JSON", null);
		}

		/*
		 * ========================= 4. Rule JSON =========================
		 */
		Object consClob = mapTemp.get("FRM_CONS_JSON");
		if (consClob instanceof Clob) {
			result.put("FRM_CONS_JSON", clobToString((Clob) consClob));
		} else {
			result.put("FRM_CONS_JSON", null);
		}

		return result;
	}	
	/* 추가끝 */	
}
