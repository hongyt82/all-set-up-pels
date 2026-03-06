package com.khnp.pels.outcome.controller;

import com.khnp.pels.common.service.PELSFileService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;
import com.khnp.pels.outcome.service.PELSOutcomeService;
import common.util.HttpConnectionUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * 결과관리 > 정주기시험
 * 결과관리 > 점검관리(붙임)
 * 결과관리 > 일반양식
 * @author dev004
 *
 */
@Controller
public class PELSOutcomeItemController {
	private static final Logger log = LoggerFactory.getLogger(PELSOutcomeItemController.class);
	
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
	
	
	/**
	 * 시험(점검)관리 > 시험(점검)수행 모니터링 > 시험(점검)자료 이력
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Item_Search.do","/Outcome_Item_Search_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView outcomeItemSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String SH_RMK_NM = StringUtil.nvl(request.getParameter("SH_RMK_NM"), "");
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), "");
		String URL = StringUtil.nvl(request.getParameter("URL"), "");
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("SH_TITL_NM", SH_TITL_NM);
		paramMap.put("SH_RMK_NM", SH_RMK_NM);
		paramMap.put("FRM_ID", "");
		paramMap.put("CHCK_YN", "");
		
		Map<String, String> examDetail = pelsOutcomeService.getDetail("ExamDetail", paramMap);
		if(examDetail != null) {
			mav.addObject("examDetail", examDetail);
		}

		ArrayList OutcomeItemList = null;
		if("FRM_MNT".equals(ATCT_CFY)) 
			OutcomeItemList = (ArrayList) pelsOutcomeService.getList("OutcomeItemMntList", paramMap);
		else
			OutcomeItemList = (ArrayList) pelsOutcomeService.getList("OutcomeItemList", paramMap);
		
		int totalCnt = OutcomeItemList.size();
		int checkedCnt = 0;
		if("FRM_MNT".equals(ATCT_CFY))
			checkedCnt = pelsOutcomeService.getCount("OutcomeItemMntCount", paramMap);
		else 
			checkedCnt = pelsOutcomeService.getCount("OutcomeItemCount", paramMap);
		
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("SH_TITL_NM", SH_TITL_NM);
		mav.addObject("SH_RMK_NM", SH_RMK_NM);
		mav.addObject("URL", URL);
		
		// // [수행 1건 / 전체 2건 - 완료율:50%]
		String TCNT = "전체 0건";
		if(totalCnt > 0) {
			double percentage = ((double) checkedCnt / totalCnt) * 100;
			TCNT = "[수행 " + checkedCnt + "건 / 전체 " + totalCnt + "건 - 완료율:" + Math.round(percentage) + "%]"; 
		}
		
		if ("/Outcome_Item_Search_M.do".equals(request.getRequestURI())) {
			HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
			paramMap2.put("OutcomeItemList", OutcomeItemList);
			JSONObject JSONDATA = new JSONObject(paramMap2);
			mav.addObject("JSONDATA", JSONDATA);
			mav.setViewName("/pels/Json");
		}
		else {
			mav.addObject("TCNT", TCNT);
			mav.addObject("OutcomeItemList", OutcomeItemList);
			mav.addObject("ATCT_CFY", ATCT_CFY);
			mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
			
			switch(ATCT_CFY) {
				case "SHOWER":
					mav.setViewName("/pels/outcome/Outcome_ItemSHOWER_Search");
					break;
				case "FME":
					mav.setViewName("/pels/outcome/Outcome_ItemFME_Search");
					break;
				case "FRM_MNT":
					mav.setViewName("/pels/outcome/Outcome_ItemMNT_Search");
					break;
				default:
					mav.setViewName("/pels/outcome/Outcome_Item_Search");
					break;
			}
		}
		
		
		return mav;
	}
	
	
	/**
	 * 결과관리 > 일반양식
	 * @param request
	 * @return
	 */
	@RequestMapping("/Outcome_ItemMnt_Download.do")
	public void Outcome_ItemMnt_Download (HttpServletRequest request, HttpServletResponse response) throws UnsupportedEncodingException {

		String OZ_HOME = utilProperties.getProperty("OZ_HOME");
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");

		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		
		HttpSession session = request.getSession();
		String LOGIN_USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		
		Map<String, String> examDetail = pelsOutcomeService.getDetail("ExamDetail", paramMap);
		
		String sTitle = examDetail.get("TITL_NM");
		System.out.println("sTitle = " + sTitle);
		
		List exList = new ArrayList();
		exList = pelsOutcomeService.getList("OutcomeItemMntList2", paramMap);

	    XSSFWorkbook mWorkbook = new XSSFWorkbook();
        XSSFSheet sheet = mWorkbook.createSheet("Sheet1");

        XSSFRow titleRow = sheet.createRow(0);
        XSSFCell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("현장 임시보관함 점검결과표");
        
        CellStyle titleStyle = mWorkbook.createCellStyle();
        XSSFFont titleFont = mWorkbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 20);
        titleStyle.setFont(titleFont);
        
        titleStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
        titleStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
        titleCell.setCellStyle(titleStyle);
        
        // A ~ F 병합
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
                        
        String[] headers = {"관리번호", "점검결과", "조치필요사항", "점검자", "점검일시", "파일링크"};
        XSSFRow headerRow = sheet.createRow(2);
        
        XSSFCellStyle headerStyle = mWorkbook.createCellStyle();

        headerStyle.setBorderBottom(XSSFCellStyle.BORDER_THIN);
        headerStyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());

        headerStyle.setBorderLeft(XSSFCellStyle.BORDER_THIN);
        headerStyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());

        headerStyle.setBorderRight(XSSFCellStyle.BORDER_THIN);
        headerStyle.setRightBorderColor(IndexedColors.BLACK.getIndex());

        headerStyle.setBorderTop(XSSFCellStyle.BORDER_THIN);
        headerStyle.setTopBorderColor(IndexedColors.BLACK.getIndex());

        headerStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);

        headerStyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(196, 215, 155)));

        headerStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
        
        headerStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);

        headerStyle.setWrapText(true);
        headerRow.setHeight((short) 500);
        
        for (int i = 0; i < headers.length; i++) {
        	XSSFCell cell = headerRow.createCell(i);
        	cell.setCellValue(headers[i]);
        	cell.setCellStyle(headerStyle);
        }
        
        
        //Row.createCell(0).setCellValue("관리번호");
        //Row.createCell(1).setCellValue("점검결과");
        //Row.createCell(2).setCellValue("조치필요사항");
        //Row.createCell(3).setCellValue("점검자");
        //Row.createCell(4).setCellValue("점검일시");
        //Row.createCell(5).setCellValue("파일링크");
		        
        for (int i = 0; i < exList.size(); i++) {
	        XSSFCellStyle sheetStyle = mWorkbook.createCellStyle();

	        sheetStyle.setBorderBottom(XSSFCellStyle.BORDER_THIN);
	        sheetStyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());
	
	        sheetStyle.setBorderLeft(XSSFCellStyle.BORDER_THIN);
	        sheetStyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());
	
	        sheetStyle.setBorderRight(XSSFCellStyle.BORDER_THIN);
	        sheetStyle.setRightBorderColor(IndexedColors.BLACK.getIndex());
	
	        sheetStyle.setBorderTop(XSSFCellStyle.BORDER_THIN);
	        sheetStyle.setTopBorderColor(IndexedColors.BLACK.getIndex());	 
	        
	    	HashMap<String, String> map = (HashMap<String, String>) exList.get(i);
	    	String UNQ_ID = map.get("UNQ_ID");
	    	String CHCK_YN = map.get("CHCK_YN");
	    	String REGPR_ID = map.get("REGPR_ID");
	    	String REGPR_NM = map.get("REGPR_NM");
	    	String RMK_NM = map.get("RMK_NM");
	    	String OZD_NAME = map.get("OZD_NAME");
	    	String FM_RG_DT = map.get("FM_RG_DT");
	    	
	    	headerRow = sheet.createRow(i+3);
	   
	        
	    	XSSFCell dataCell =  headerRow.createCell(0, XSSFCell.CELL_TYPE_STRING);
	    	dataCell.setCellValue(UNQ_ID);
	    	dataCell.setCellStyle(sheetStyle);
	        sheet.setColumnWidth(0, 6000);
	        
	        headerRow.createCell(1).setCellValue(CHCK_YN);
	        sheet.setColumnWidth(1, 6000);
	        headerRow.getCell(1).setCellStyle(sheetStyle);
	        headerRow.createCell(2).setCellValue(RMK_NM);
	        sheet.setColumnWidth(2, 20000);
	        headerRow.getCell(2).setCellStyle(sheetStyle);
	        headerRow.createCell(3).setCellValue(REGPR_NM);
	        sheet.setColumnWidth(3, 4000);
	        headerRow.getCell(3).setCellStyle(sheetStyle);
	        headerRow.createCell(4).setCellValue(FM_RG_DT);
	        sheet.setColumnWidth(4, 6000);
	        headerRow.getCell(4).setCellStyle(sheetStyle);
	        headerRow.createCell(5).setCellValue(UNQ_ID + ".pdf");
	        sheet.setColumnWidth(5, 8000);
	        //headerRow.getCell(5).setCellStyle(sheetStyle);
	        
	        XSSFCreationHelper CH = mWorkbook.getCreationHelper();
	        XSSFHyperlink link = CH.createHyperlink(XSSFHyperlink.LINK_FILE);
	        XSSFCellStyle hlink_style = mWorkbook.createCellStyle();
	        XSSFFont hlink_font = mWorkbook.createFont();
	        hlink_font.setUnderline(XSSFFont.U_SINGLE);
	        hlink_font.setColor(IndexedColors.BLUE.getIndex());
	        hlink_style.setFont(hlink_font);

	        hlink_style.setBorderBottom(XSSFCellStyle.BORDER_THIN);
	        hlink_style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
	
	        hlink_style.setBorderLeft(XSSFCellStyle.BORDER_THIN);
	        hlink_style.setLeftBorderColor(IndexedColors.BLACK.getIndex());
	
	        hlink_style.setBorderRight(XSSFCellStyle.BORDER_THIN);
	        hlink_style.setRightBorderColor(IndexedColors.BLACK.getIndex());
	
	        hlink_style.setBorderTop(XSSFCellStyle.BORDER_THIN);
	        hlink_style.setTopBorderColor(IndexedColors.BLACK.getIndex());	 
	        
	        XSSFCell cell =  headerRow.getCell(5);
	        link.setAddress( UNQ_ID + ".pdf");
	        cell.setHyperlink(link);
	        cell.setCellStyle(hlink_style);	     
	        
       
		}			        	
		
		try {
			FileOutputStream fos = new FileOutputStream(PELS_DIR + "/upload/" + "현장 임시 보관함 점검결과표.xlsx");
			mWorkbook.write(fos);
			fos.close();
		}
		catch(IOException ex)
		{
			
		}
		
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition"
				          //,"=?UTF-8?Q?" 
		                  ,"attachment;" 
		                  +"filename=" 
				          + URLEncoder.encode("현장 임시 보관함 점검결과표", "UTF-8")  + ".zip;");		
		response.setStatus(HttpServletResponse.SC_OK);		
		
		try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())){
		    Path oFullFileName_excel = Paths.get(PELS_DIR + "/upload/" + "현장 임시 보관함 점검결과표.xlsx");
		    Path src_excel = oFullFileName_excel;
			
			try(FileInputStream fis = new FileInputStream(src_excel.toFile())){
				ZipEntry zipEntry = new ZipEntry(src_excel.getFileName().toString());
				
				zos.putNextEntry(zipEntry);
				
				byte[] buffer = new byte[1024];
				int len;
				while((len = fis.read(buffer)) > 0) {
					zos.write(buffer, 0, len);
				}
				zos.closeEntry();
			}
			
			for (int i = 0; i < exList.size(); i++){	
		    	HashMap<String, String> map = (HashMap<String, String>) exList.get(i);
		    	String UNQ_ID = map.get("UNQ_ID");
		    	String CHCK_YN = map.get("CHCK_YN");
		    	String REGPR_ID = map.get("REGPR_ID");
		    	String REGPR_NM = map.get("REGPR_NM");
		    	String RMK_NM = map.get("RMK_NM");
		    	String OZD_NAME = map.get("OZD_NAME");
		    	
		    	System.out.println("UNQ_ID = " + UNQ_ID);
		    	System.out.println("OZD_NAME = " + OZD_NAME);
		    	System.out.println("-------------------------------------------------------------------");
		    	
				HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
				
				HashMap paramsMap = new HashMap();
				HttpConnectionUtil HUtil = new HttpConnectionUtil();
			    paramsMap.put("ozdName", "GE_MP_FRMMNT_S/" + OZD_NAME);
			    paramsMap.put("PdfName", "");
			    paramsMap.put("USER_ID", REGPR_ID);
			    String result2 = HUtil.postRequest(OZ_HOME + "/pels/ozd_to_pdf.jsp", paramsMap);
			    
			    Path FullFileName = Paths.get(PELS_DIR + "/upload/PDF_DOWN/" + REGPR_ID + "_pdf_result.pdf");
			    Path oFullFileName = Paths.get(PELS_DIR + "/upload/PDF_DOWN/" + UNQ_ID + ".pdf");
			    Path newFilePath = Files.move(FullFileName, oFullFileName, StandardCopyOption.REPLACE_EXISTING);
				Path src = oFullFileName;
				
				try(FileInputStream fis = new FileInputStream(src.toFile())){
					ZipEntry zipEntry = new ZipEntry(src.getFileName().toString());
					
					zos.putNextEntry(zipEntry);
					
					byte[] buffer = new byte[1024];
					int len;
					while((len = fis.read(buffer)) > 0) {
						zos.write(buffer, 0, len);
					}
					zos.closeEntry();
				}
			}	
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	
	/**
	 * 절차서(서식)관리 > 점검관리(붙임) > 관리항목 > 관리항목 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Outcome_ItemMNT_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Outcome_ItemMNT_Input (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); // 서식고유키값
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); // 서식고유키값
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), ""); // 서식고유키값
		String URL = StringUtil.nvl(request.getParameter("URL"), ""); // 서식고유키값
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), ""); // 서식고유키값
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 정주기서식정보(GE_MP_FRM_M)
		Map<String, String> examDetail = pelsOutcomeService.getDetail("ExamDetail", paramMap);
		
		mav.addObject("examDetail", examDetail);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("ATCT_CFY", ATCT_CFY);
		mav.addObject("URL", URL);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		
		
		mav.setViewName("/pels/outcome/Outcome_ItemMNT_Input");
		
		return mav;
	}
	
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Outcome_ItemMNT_Update.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Outcome_ItemMNT_Update (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), "");
		String ATCT_CFY = StringUtil.nvl(request.getParameter("ATCT_CFY"), "");
		String URL = StringUtil.nvl(request.getParameter("URL"), "");
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		Map<String, String> ItemMntDetail = pelsOutcomeService.getDetail("Outcome_ItemMnt_Detail", paramMap);
		mav.addObject("ItemMntDetail", ItemMntDetail);
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		Map<String, String> examDetail = pelsOutcomeService.getDetail("ExamDetail", paramMap);
		mav.addObject("examDetail", examDetail);
		
		mav.addObject("UNQ_KY_VAL", UNQ_KY_VAL);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("ATCT_CFY", ATCT_CFY);
		mav.addObject("URL", URL);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		
		mav.setViewName("/pels/outcome/Outcome_ItemMNT_Update");
		return mav;
	}	
	
	@RequestMapping(value={"/Outcome_ItemMNT_Insert_Ajax.do", "/Outcome_ItemMNT_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> examSave (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""); 
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); 
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); 
		
		String UNQ_ID = StringUtil.nvl(request.getParameter("UNQ_ID"), "");
		String TH1_ITM_NM = StringUtil.nvl(request.getParameter("TH1_ITM_NM"), "");
		String RMK_NM = StringUtil.nvl(request.getParameter("RMK_NM"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("UNQ_ID", UNQ_ID);
		paramMap.put("TH1_ITM_NM", TH1_ITM_NM);
		paramMap.put("RMK_NM", RMK_NM);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Outcome_ItemMNT_Insert_Ajax.do".equals(request.getRequestURI())) {
				pelsOutcomeService.insert("InsertOutcomeItemMnt", paramMap);
				resultMsg = "저장이 완료되었습니다.";
			}
			else if ("/Outcome_ItemMNT_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsOutcomeService.update("UpdateOutcomeItemMnt", paramMap);
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
	
	@RequestMapping(value="/Outcome_ItemMNT_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formDelete (HttpServletRequest request) {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		String UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("UNQ_KY_VAL", UNQ_KY_VAL);
		
		String resultMsg =  "";
		String resultCd = "false";
		int resultCnt = 0;
		
		try {
			resultCnt = pelsOutcomeService.delete("DeleteOutcomeItemMnt", map);
			resultMsg =  "삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "삭제에 실패하였습니다.";
			log.error("formDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "ItemMntDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
}
