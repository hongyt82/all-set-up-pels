package com.khnp.pels.exam.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Clob;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.databind.ObjectMapper;
//import com.khnp.pels.common.util.ElinkV2RootUtil;
import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.exam.dto.PdfInfo;
import com.khnp.pels.exam.dto.PdfJson;
import com.khnp.pels.exam.dto.PdfPage;
import com.khnp.pels.exam.service.PELSExamService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSExamController {

	private static final Logger log = LoggerFactory.getLogger(PELSExamController.class);
	
	@Autowired
	private PELSExamService pelsExamService;
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	@Resource(name = "utilProperties")
	private Properties utilProperties;	

	/**
	 * 나의문서 > 준비 및 수행중
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
		paramMap.put("CHCK_STRT_DT", "");
		paramMap.put("CHCK_END_DT", "");
		paramMap.put("CHKPR_ID", "");
		//paramMap.put("CHCK_STRT_DT", nowDateString);
		//paramMap.put("CHCK_END_DT", nowDateString);
		
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String SH_CHCK_TITL = StringUtil.nvl(request.getParameter("SH_CHCK_TITL"), "");
		String SH_SORT = StringUtil.nvl(request.getParameter("SH_SORT"), "LAST_MDF_DT");
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), "");
		
		paramMap.put("PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("PRCDOC_NM", SH_PRCDOC_NM);
		paramMap.put("CHCK_TITL", SH_CHCK_TITL);
		paramMap.put("SH_SORT", SH_SORT);		
		paramMap.put("PRSTS_CFY", PRSTS_CFY);
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		int TCNT = pelsExamService.getCount("ExamCount", paramMap); // 총 조회수
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
		
		ArrayList examList = (ArrayList) pelsExamService.getList("ExamList", paramMap);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsExamService.getList("GetPlantCode", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);		
		mav.addObject("SH_PRCDOC_NM", SH_PRCDOC_NM);		
		mav.addObject("SH_CHCK_TITL", SH_CHCK_TITL);		
		mav.addObject("SH_SORT", SH_SORT);			
		mav.addObject("PRSTS_CFY", PRSTS_CFY);			
		
		mav.addObject("plantList", plantList);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("examList", examList);
		mav.setViewName("/pels/exam/Exam_Search");
		
		return mav;
	}
	
	/**
	 * 나의문서 > 준비 및 수행중
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_Search1.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView examSearch1 (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));			
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String nowDateString = LocalDate.now().format(formatter).replaceAll("-", "");
		paramMap.put("CHCK_STRT_DT", "");
		paramMap.put("CHCK_END_DT", "");
		paramMap.put("CHKPR_ID", "");
		//paramMap.put("CHCK_STRT_DT", nowDateString);
		//paramMap.put("CHCK_END_DT", nowDateString);
		
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String SH_CHCK_TITL = StringUtil.nvl(request.getParameter("SH_CHCK_TITL"), "");
		String SH_SORT = StringUtil.nvl(request.getParameter("SH_SORT"), "CHCK_STRT_DT");
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), "");
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), "");
		
		paramMap.put("PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("PRCDOC_NM", SH_PRCDOC_NM);
		paramMap.put("CHCK_TITL", SH_CHCK_TITL);
		paramMap.put("SH_SORT", SH_SORT);		
		paramMap.put("PRSTS_CFY", PRSTS_CFY);
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		int TCNT = pelsExamService.getCount("ExamCount", paramMap); // 총 조회수
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
		
		ArrayList examList = (ArrayList) pelsExamService.getList("ExamList", paramMap);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsExamService.getList("GetPlantCode", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);		
		mav.addObject("SH_PRCDOC_NM", SH_PRCDOC_NM);		
		mav.addObject("SH_CHCK_TITL", SH_CHCK_TITL);		
		mav.addObject("SH_SORT", SH_SORT);			
		mav.addObject("PRSTS_CFY", PRSTS_CFY);			
		mav.addObject("USER_ID", USER_ID);			
		
		mav.addObject("plantList", plantList);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("examList", examList);
		mav.setViewName("/pels/exam/Exam_Search1");
		
		return mav;
	}

	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView examInput (HttpServletRequest request) {
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String CHKPR_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String CHKPR_FNM = (String) session.getAttribute("LOGIN_USER_NM");
		
		paramMap.put("LAST_UPDR_ID", "");
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		
		ArrayList PrcdocList = (ArrayList) pelsExamService.getList("ProcedureList", paramMap); // 정주기시험 리스트
		mav.addObject("PrcdocList", PrcdocList);
		
		// 시험시작, 종료일자 초기세팅
		String nowDateString = LocalDate.now().format(formatter);
		
		mav.addObject("CHCK_STRT_DT", nowDateString);
		mav.addObject("CHCK_END_DT", nowDateString);
		mav.addObject("CHKPR_ID", CHKPR_ID);
		mav.addObject("CHKPR_FNM", CHKPR_FNM);
		
		mav.setViewName("/pels/exam/Exam_Input");
		
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
		
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");
		// 시험점검이력정보(GE_MP_CHECK_S) 조회
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("CHCK_SNO", CHCK_SNO);
		Map<String, String> examDetail = pelsExamService.getDetail("ExamDetail", paramMap);
		
		mav.addObject("CHCK_SNO", CHCK_SNO);
		
		mav.addObject("examDetail", examDetail);
		
		mav.setViewName("/pels/exam/Exam_Detail");
		
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
	
	
	public String SAPFile(HashMap<String, Object> paramMap, String PELS_DIR, String FILE_URL, String ATFL_SEQ, String USER_ID,  String USER_NM, String USER_DEPT_NM)
	{
		int ret = 0;

		// SAP 파일명
		paramMap.put("CHCK_TITL", FILE_URL);
		
		SimpleDateFormat format2 = new SimpleDateFormat("yyyyMMddHHmmSSSss", java.util.Locale.KOREA);
		
		Date nowDate = new Date();

		String ATFL_ID = format2.format(new Date());
		String ATFL_NO = "1";
		
		String CHCK_SNO = pelsExamService.getLastUnqKey("ExamLastUnqNo");
		paramMap.put("CHCK_SNO", CHCK_SNO);
		
		String PRCDOC_SNO = "";
		
		// 기존에 절차서가 등로되어 있는지 확인한다.
		Map<String, String> proDetail = pelsExamService.getDetail("ProcedureDetail2", paramMap);
		System.out.println(proDetail);
		if(proDetail == null ) {
			ret = pelsExamService.insert("InsertProcedure", paramMap);
			PRCDOC_SNO = pelsExamService.getLastUnqKey("ProcedureMaxUnqNo");
		}
		else {
			PRCDOC_SNO = String.valueOf(proDetail.get("PRCDOC_SNO"));
		}
		paramMap.put("PRCDOC_SNO", PRCDOC_SNO);
		paramMap.put("ATFL_ID", ATFL_ID);
		paramMap.put("ATFL_NO", ATFL_NO);
		
		ret = pelsExamService.insert("InsertExam", paramMap);
		SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmssSSS", java.util.Locale.KOREA);
		format2 = new SimpleDateFormat("yyyyMMddHHmmSSSss", java.util.Locale.KOREA);
		SimpleDateFormat format_yyyymm = new SimpleDateFormat("yyyyMM", java.util.Locale.KOREA);
		SimpleDateFormat format_dd = new SimpleDateFormat("dd", java.util.Locale.KOREA);
		
		nowDate = new Date();
		
		String filename1 = format.format(new Date());
		String filename2 = format2.format(new Date());
		String filename3 = ((int)(Math.random() * 899)) + 100 + "";
		String filepath  = format_yyyymm.format(nowDate) + "/" + format_dd.format(nowDate); 
		
		File mppsFolder = new File(PELS_DIR + "/upload/" + format_yyyymm.format(nowDate));

		// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
		if (!mppsFolder.exists()) {
			mppsFolder.mkdir(); //폴더 생성합니다.
		}
		File upperFolder = new File(PELS_DIR + "/upload/" + format_yyyymm.format(nowDate) + "/" + format_dd.format(nowDate));

		// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
		if (!upperFolder.exists()) {
			upperFolder.mkdir(); //폴더 생성합니다.
		}
		
		
		String ATFL_PHCL_NM = filename1 +"_"+ filename2 + "_" + filename3;
		String newfileName = ATFL_PHCL_NM + ".pdf";
		
		String Old_FilePath = PELS_DIR + "/upload/default.pdf";
		String New_FilePath = PELS_DIR + "/upload/" + filepath + "/" + newfileName;
		try {
		
			Files.copy(Paths.get(Old_FilePath), Paths.get(New_FilePath), StandardCopyOption.REPLACE_EXISTING);
			
			Path path = Paths.get(New_FilePath);
	        long size = Files.size(path);
			
			paramMap.put("ATFL_ID", ATFL_ID);
			paramMap.put("ATFL_NO", ATFL_NO);
			paramMap.put("ATFL_PTH_NM", PELS_DIR + "/upload/" + filepath);
			paramMap.put("ATFL_ORSRC_TITL_NM", FILE_URL);
			paramMap.put("ATFL_PHCL_NM", filepath + "/" + newfileName);
			paramMap.put("ATFL_SZ", String.valueOf(size));
			paramMap.put("ATFL_SEQ", ATFL_SEQ);
			ret = pelsExamService.insert("InsertFile", paramMap);
			
			File file = new File(New_FilePath);
			
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
				paramMap.put("WRTE_JSON_DCR", jsonString);
				paramMap.put("CMP_JSON_DCR", "");
				paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
				paramMap.put("REGPR_FNM", StringUtil.nvl(USER_NM, ""));
	
		        pelsExamService.insert("InsertExamJson", paramMap);
			}
		}
		catch(Exception ex) {
			System.out.println(ex.toString());
			return "";
		}
		
		return CHCK_SNO;
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
		//HttpSession session = request.getSession();
		HttpSession session = request.getSession();
		String PLANT = (String) session.getAttribute("LOGIN_USER_PLANT_CD");
	
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");
		
		String CHCK_STRT_DT = StringUtil.nvl(request.getParameter("CHCK_STRT_DT"), "");
		String CHCK_END_DT = StringUtil.nvl(request.getParameter("CHCK_END_DT"), "");
		
		CHCK_STRT_DT = CHCK_STRT_DT.replaceAll("-", "");
		CHCK_END_DT = CHCK_END_DT.replaceAll("-", "");
		
		String PWPL_ID = StringUtil.nvl(request.getParameter("PWPL_ID"), PLANT); 	 // 발전소ID
		String CHCK_TITL = StringUtil.nvl(request.getParameter("CHCK_TITL"), ""); 		// 제목명
		String WRKOR_NO = StringUtil.nvl(request.getParameter("WRKOR_NO"), ""); 		// 작업오더번호
		String ATWT_RQST_YN = StringUtil.nvl(request.getParameter("ATWT_RQST_YN"), ""); // 입회요청여부
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), "R"); 		// 진행상태구분
		String CHKPR_ID = StringUtil.nvl(request.getParameter("CHKPR_ID"), ""); 		// 점검자ID
		String CHKPR_FNM = StringUtil.nvl(request.getParameter("CHKPR_FNM"), ""); 		// 점검자명
		String CNMR_ID = StringUtil.nvl(request.getParameter("CNMR_ID"), ""); 			// 확인자ID
		String CNMR_FNM = StringUtil.nvl(request.getParameter("CNMR_FNM"), ""); 		// 학인자명
		String AAWPR_ID = StringUtil.nvl(request.getParameter("AAWPR_ID"), ""); 		// 입회자
		String AAWPR_FNM = StringUtil.nvl(request.getParameter("AAWPR_FNM"), ""); 		// 학인자명
		
		String DOC_TYP_CD = StringUtil.nvl(request.getParameter("DOC_TYP_CD"), "");
		String PRT_NO = StringUtil.nvl(request.getParameter("PRT_NO"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		String PRCDOC_RVSN_NO = StringUtil.nvl(request.getParameter("PRCDOC_RVSN_NO"), "");
		String FILE_URL1 = StringUtil.nvl(request.getParameter("FILE_URL1"), "");
		String FILE_URL2 = StringUtil.nvl(request.getParameter("FILE_URL2"), "");
		String FILE_URL3 = StringUtil.nvl(request.getParameter("FILE_URL3"), "");
		String FILE_URL4 = StringUtil.nvl(request.getParameter("FILE_URL4"), "");
		String FILE_URL5 = StringUtil.nvl(request.getParameter("FILE_URL5"), "");

		String USER_ID = CHKPR_ID;
		String USER_NM = CHKPR_FNM;
		String USER_DEPT_NM = "정비기술부";
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		PWPL_ID = "2230";
		paramMap.put("PWPL_ID", PWPL_ID);
		paramMap.put("CHCK_SNO", CHCK_SNO);
		paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT);
		paramMap.put("CHCK_END_DT", CHCK_END_DT);
		
		paramMap.put("CHCK_TITL", CHCK_TITL);
		paramMap.put("CHKPR_ID", CHKPR_ID);
		paramMap.put("CHKPR_FNM", CHKPR_FNM);
		paramMap.put("WRKOR_NO", WRKOR_NO);
		paramMap.put("ATWT_RQST_YN", ATWT_RQST_YN);
		paramMap.put("PRSTS_CFY", PRSTS_CFY);
		
		paramMap.put("CNMR_ID", CNMR_ID);
		paramMap.put("CNMR_FNM", CNMR_FNM);
		paramMap.put("AAWPR_ID", AAWPR_ID);
		paramMap.put("AAWPR_FNM", AAWPR_FNM);
		
		// 등록자
		paramMap.put("FIRST_CPER_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("LAST_UPDR_ID", StringUtil.nvl(USER_ID, ""));
		
		paramMap.put("DOC_TYP_CD", DOC_TYP_CD);
		paramMap.put("PRT_NO", PRT_NO);
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		paramMap.put("PRCDOC_RVSN_NO", PRCDOC_RVSN_NO);
		paramMap.put("FIRST_CRER_ID", USER_ID);
		paramMap.put("LAST_UPDR_ID", USER_ID);
		
		// 그룹명
		paramMap.put("ATFL_GRUP_NM", AtflGrupNm.EXAM_S);

		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;	
		System.out.println("mReq = " + mReq);
		String resultMsg = "";
		String resultCd = "false";
		String retKey = "";
		
		try {
			if ("/Exam_Insert_Ajax.do".equals(request.getRequestURI())) {
				if(!"".equals(FILE_URL1)) 
					retKey += SAPFile(paramMap, PELS_DIR, FILE_URL1, "1", USER_ID, USER_NM, USER_DEPT_NM);
				if(!"".equals(FILE_URL2)) 	
					retKey += "," + SAPFile(paramMap, PELS_DIR, FILE_URL2, "1", USER_ID, USER_NM, USER_DEPT_NM);
				if(!"".equals(FILE_URL3)) 	
					retKey += "," + SAPFile(paramMap, PELS_DIR, FILE_URL3, "1", USER_ID, USER_NM, USER_DEPT_NM);
				if(!"".equals(FILE_URL4)) 	
					retKey += "," + SAPFile(paramMap, PELS_DIR, FILE_URL4, "1", USER_ID, USER_NM, USER_DEPT_NM);
				if(!"".equals(FILE_URL5)) 	
					retKey += "," + SAPFile(paramMap, PELS_DIR, FILE_URL5, "1", USER_ID, USER_NM, USER_DEPT_NM);
				
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
		
		resultMap.put("CHCK_SNO", retKey);
		resultMap.put("callMethod", "examSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 시험상태 저장(_M, PC 같이처리
	 * @param request
	 * @return
	 * @throws ServletException 
	 */
	@RequestMapping(value={"/Exam_CFY_Update.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Exam_CFY_Update (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String REGPR_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_ID"), ""));
		String REGPR_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("REGPR_NM"), ""));
		String CHCK_SNO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHCK_SNO"), ""));
		String PRSTS_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRSTS_CFY"), ""));
		String FRM_PAGE_NO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FRM_PAGE_NO"), ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		if(!"".equals(PRSTS_CFY) && !"".equals(CHCK_SNO)) {
			try {
				HashMap<String, Object> map = new HashMap<String, Object>();
				map.put("PRSTS_CFY", PRSTS_CFY);
				map.put("CHCK_SNO", CHCK_SNO);
		
				pelsExamService.update("UpdateCheck_CFY", map);
				
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
	
	/**
	 * 절차서(서식) 팝업
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_PrcdocList.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_PrcdocList (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "10"));		
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		paramMap.put("PRCDOC_NO", ""); 				// 절차서번호
		paramMap.put("PRCDOC_NM", ""); 				// 절차서명
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsExamService.getCount("ProcedureCount", paramMap); // 총 조회수
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
		
		
		ArrayList PrcdocList = (ArrayList) pelsExamService.getList("ProcedureList", paramMap);
		mav.addObject("PrcdocList", PrcdocList);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
	
		mav.setViewName("/pels/exam/Exam_PrcdocList");
		
		return mav;
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
		System.out.println("USER_ID :" + USER_ID);
		System.out.println("========================================================================");
		
		
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");
		mav.addObject("CHCK_SNO", CHCK_SNO);
		//ElinkV2RootUtil.addToModel(request, mav, utilProperties);
			
		mav.setViewName("/pels/popup/KhnpViewer");
		
		return mav;
	}	
	
	/**
	 * Viewer 페이지 호출
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

		
		String PWPL_ID = StringUtil.nvl(request.getParameter("PWPL_ID"), "");
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		String CHCK_TITL = StringUtil.nvl(request.getParameter("CHCK_TITL"), "");
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), "R");
		mav.addObject("PWPL_ID", PWPL_ID);
		mav.addObject("CHCK_SNO", CHCK_SNO);
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("CHCK_TITL", CHCK_TITL);
		mav.addObject("PRSTS_CFY", PRSTS_CFY);
		//ElinkV2RootUtil.addToModel(request, mav, utilProperties);
			
		mav.setViewName("/pels/exam/Exam_KhnpViewer");
		
		return mav;
	}
	
	/**
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_KhnpReplayViewer.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_KhnpReplayViewer (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		System.out.println("========================================================================");
		System.out.println("USER_ID : " + USER_ID);
		System.out.println("========================================================================");
		
		
		String PWPL_ID = StringUtil.nvl(request.getParameter("PWPL_ID"), "");
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		String CHCK_TITL = StringUtil.nvl(request.getParameter("CHCK_TITL"), "");
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), "R");
		mav.addObject("PWPL_ID", PWPL_ID);
		mav.addObject("CHCK_SNO", CHCK_SNO);
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("CHCK_TITL", CHCK_TITL);
		mav.addObject("PRSTS_CFY", PRSTS_CFY);
		//ElinkV2RootUtil.addToModel(request, mav, utilProperties);
			
		mav.setViewName("/pels/exam/Exam_KhnpReplayViewer");
		
		return mav;
	}	
	
	/**
	 *
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Exam_SapList.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_SapList (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		// 조회조건
		String SH_DOC_TYP_CD = StringUtil.nvl(request.getParameter("SH_DOC_TYP_CD"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRT_NO = StringUtil.nvl(request.getParameter("SH_PRT_NO"), "");
		
		ArrayList SapList = new ArrayList();
		paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_NO", "정기2-28300A"); 
		paramMap.put("PRCDOC_NM", "제2정지계통 트립 시험"); 
		paramMap.put("DOC_TYP_CD", "FP0"); 
		paramMap.put("PRT_NO", "000"); 
		paramMap.put("PRCDOC_RVSN_NO", "08"); 
		SapList.add(paramMap);
		
		paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_NO", "정기2-28300B"); 
		paramMap.put("PRCDOC_NM", "제2정지계통 주기 채널 기능시험(1주)"); 
		paramMap.put("DOC_TYP_CD", "FP0"); 
		paramMap.put("PRT_NO", "000"); 
		paramMap.put("PRCDOC_RVSN_NO", "09"); 
		SapList.add(paramMap);

		paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_NO", "정기2-28300E"); 
		paramMap.put("PRCDOC_NM", "제2정지계통 중성자 트립 설정치 선택시험"); 
		paramMap.put("DOC_TYP_CD", "FP0"); 
		paramMap.put("PRT_NO", "000"); 
		paramMap.put("PRCDOC_RVSN_NO", "08"); 
		SapList.add(paramMap);
		
		paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_NO", "정기2-28332B"); 
		paramMap.put("PRCDOC_NM", "제2정지계통 노외 대수형 중성자 고변화율(저출력시)"); 
		paramMap.put("DOC_TYP_CD", "FP0"); 
		paramMap.put("PRT_NO", "000"); 
		paramMap.put("PRCDOC_RVSN_NO", "05"); 
		SapList.add(paramMap);
		
		paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_NO", "정기2-28333A"); 
		paramMap.put("PRCDOC_NM", "제2정지계통 냉각재 고/저압력 채널 기능시험"); 
		paramMap.put("DOC_TYP_CD", "FP0"); 
		paramMap.put("PRT_NO", "000"); 
		paramMap.put("PRCDOC_RVSN_NO", "06"); 
		SapList.add(paramMap);
		
		mav.addObject("SapList", SapList);
		
		mav.addObject("SH_DOC_TYP_CD", SH_DOC_TYP_CD);
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);
		mav.addObject("SH_PRT_NO", SH_PRT_NO);
		
		mav.setViewName("/pels/exam/Exam_SapList");
		
		return mav;
	}
	
	@RequestMapping(value= {"/Exam_SapFileList.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_SapFileList (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		// 조회조건
		String SH_DOC_TYP_CD = StringUtil.nvl(request.getParameter("SH_DOC_TYP_CD"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRT_NO = StringUtil.nvl(request.getParameter("SH_PRT_NO"), "");
		
		// 페이지 처리 항목
		String DOC_TYP_CD = StringUtil.nvl(request.getParameter("DOC_TYP_CD"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		String PRT_NO = StringUtil.nvl(request.getParameter("PRT_NO"), "");
		String PRCDOC_RVSN_NO = StringUtil.nvl(request.getParameter("PRCDOC_RVSN_NO"), "");
		
		ArrayList SapList = new ArrayList();
		paramMap = new HashMap<String, Object>();
		paramMap.put("FILE_NAME", "정기-0000(개정01)_본문.pdf"); 
		SapList.add(paramMap);
		
		paramMap = new HashMap<String, Object>();
		paramMap.put("FILE_NAME", "정기-0000(개정01)_개정이력.pdf"); 
		SapList.add(paramMap);

		paramMap = new HashMap<String, Object>();
		paramMap.put("FILE_NAME", "정기-0000(개정01)_붙임 13.1 점검지.pdf"); 
		SapList.add(paramMap);
		
		mav.addObject("SH_DOC_TYP_CD", SH_DOC_TYP_CD);
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);
		mav.addObject("SH_PRT_NO", SH_PRT_NO);
		
		mav.addObject("DOC_TYP_CD", DOC_TYP_CD);
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		mav.addObject("PRT_NO", PRT_NO);
		mav.addObject("PRCDOC_RVSN_NO", PRCDOC_RVSN_NO);
		
		// 시험시작, 종료일자 초기세팅
		String nowDateString = LocalDate.now().format(formatter);
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String CHKPR_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String CHKPR_FNM = (String) session.getAttribute("LOGIN_USER_NM");

		mav.addObject("CHCK_STRT_DT", nowDateString);
		mav.addObject("CHCK_END_DT", nowDateString);
		mav.addObject("CHKPR_ID", CHKPR_ID);
		mav.addObject("CHKPR_FNM", CHKPR_FNM);
		

		mav.addObject("SapFileList", SapList);
		
		mav.setViewName("/pels/exam/Exam_SapFileList");
		
		return mav;
	}
	
	
}
