package com.khnp.pels.outcome.controller;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.service.PELSFileService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;
import com.khnp.pels.outcome.service.PELSOutcomeService;
import common.util.PELS_FileUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;
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

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 결과관리 > 정주기시험
 * 결과관리 > 점검관리(붙임)
 * 결과관리 > 일반양식
 * @author dev004
 *
 */
@Controller
public class PELSOutcomeJobController {
	private static final Logger log = LoggerFactory.getLogger(PELSOutcomeJobController.class);
	
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
	 * 결과관리 > 작업전회의 현황(수력/양수)
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Job_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView EtcJobSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		HttpSession session = request.getSession();
		
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));		
		
		String PLANT_TYPE = StringUtil.nvl(request.getParameter("PLANT_TYPE"), ""); 
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); 
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), ""); 
		String PLANT = StringUtil.nvl(request.getParameter("PLANT"), ""); 
		String DEPT_NM = StringUtil.nvl(request.getParameter("DEPT_NM"), "");
		if(!"".equals(PLANT_TYPE)) {
			session.setAttribute("LOGIN_USER_ID", USER_ID);
			session.setAttribute("LOGIN_USER_NM", USER_NM);
			session.setAttribute("LOGIN_DIVS_CD", PLANT.substring(0,3));
			session.setAttribute("LOGIN_PPCD", PLANT);
			session.setAttribute("LOGIN_PWPL_CFY", PLANT_TYPE);
			session.setAttribute("LOGIN_PPCD_NM", "");
			session.setAttribute("LOGIN_TYPE_CD", PLANT_TYPE);
			session.setAttribute("LOGIN_DEPT_NM", DEPT_NM);
		}
		
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.minusDays(30);
		LocalDate endDate = nowDate;
		
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
		String PWPL_CFY = StringUtil.nvl(request.getParameter("PWPL_CFY"), LOGIN_PWPL_CFY); 
		
		//if("".equals(LOGIN_PPCD) || LOGIN_PPCD == null) {
		//	LOGIN_PPCD = "3330";
		//	LOGIN_PWPL_CFY = "2";
		//}
		if("0".equals(LOGIN_PWPL_CFY)) {
			LOGIN_PPCD = "";
		}
		
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), ""); // 제목
		String WRK_NM = StringUtil.nvl(request.getParameter("WRK_NM"), ""); // 제목
		String MTNG_DY_S = StringUtil.nvl(request.getParameter("MTNG_DY_S"), startDate.format(formatter)); 	// 시작일자
		String MTNG_DY_E = StringUtil.nvl(request.getParameter("MTNG_DY_E"), endDate.format(formatter)); // 종료일자
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("WRK_NM", WRK_NM);
		paramMap.put("REGPR_NM", "");
		paramMap.put("FRM_CFY", "");
		
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", PPCD);
		paramMap.put("PWPL_CFY", PWPL_CFY);
		paramMap.put("MTNG_DY_S", MTNG_DY_S.replaceAll("-", ""));
		paramMap.put("MTNG_DY_E", MTNG_DY_E.replaceAll("-", ""));
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("EtcJobFormCount", paramMap); // 총 조회수
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
		
			
		ArrayList etcJobList = (ArrayList) pelsOutcomeService.getList("EtcJobFormList", paramMap);
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("PWPL_CFY", "2");

		List PlantCode = (ArrayList) pelsOutcomeService.getList("GetPlantCode", map);
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);

		mav.addObject("EtcJobList", etcJobList);
		mav.addObject("PlantCode", PlantCode);
		mav.addObject("PPCD", PPCD);
		mav.addObject("PWPL_CFY", PWPL_CFY);
		mav.addObject("MTNG_DY_S", MTNG_DY_S);
		mav.addObject("MTNG_DY_E", MTNG_DY_E);
		mav.addObject("WRK_NM", WRK_NM);
			
		mav.addObject("LOGIN_PWPL_CFY", LOGIN_PWPL_CFY);
		mav.addObject("LOGIN_PPCD", LOGIN_PPCD);
		mav.addObject("LOGIN_DIVS_CD", LOGIN_DIVS_CD);
		mav.addObject("LOGIN_USER_ID", LOGIN_USER_ID);
		mav.addObject("LOGIN_USER_NM", LOGIN_USER_NM);
		
		// 검색조건 재입력
		mav.addObject("FRM_NM", FRM_NM);
		mav.setViewName("/pels/outcome/Job_Search");
		
		return mav;
	}	
	
	@RequestMapping(value="/Job_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
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
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), LOGIN_PWPL_CFY); 
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), ""); 

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("FRM_NM", "");
		paramMap.put("REGPR_NM", "");
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		mav.addObject("PPCD", PPCD);
		mav.addObject("FRM_CFY", FRM_CFY);
		
		mav.addObject("LOGIN_PWPL_CFY", LOGIN_PWPL_CFY);
		mav.addObject("LOGIN_PPCD", LOGIN_PPCD);
		mav.addObject("LOGIN_USER_ID", LOGIN_USER_ID);
		mav.addObject("LOGIN_USER_NM", LOGIN_USER_NM);
		mav.addObject("LOGIN_DIVS_CD", LOGIN_DIVS_CD);
		
		switch(FRM_CFY) {
			case "GEN":
			case "REP":
				mav.addObject("FRM_CFY", FRM_CFY);
				mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				mav.setViewName("/pels/outcome/Job_Input");
				break;
			case "MAN":
				mav.setViewName("/pels/outcome/JobMan_Input");
				break;
		}
		
		return mav;
	}
	
	@RequestMapping(value={"/JobMan_Insert_Ajax.do", "/JobMan_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> JobMan_Insert_Ajax (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = StringUtil.nvl((String) session.getAttribute("LOGIN_DIVS_CD"), "");
		String PPCD = StringUtil.nvl((String) session.getAttribute("LOGIN_PPCD"), "");
		
		USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), USER_ID);
		USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), USER_NM);
		DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), DIVS_CD);
		PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), PPCD);
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_VER_NO = StringUtil.nvl(request.getParameter("PRCDOC_VER_NO"), "");
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), "JOB");
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), "");

		String MTNG_DY = StringUtil.nvl(request.getParameter("MTNG_DY"), "");
		String MTNG_TITL = StringUtil.nvl(request.getParameter("MTNG_TITL"), "");
		String MTNG_HSMPR_ID = StringUtil.nvl(request.getParameter("MTNG_HSMPR_ID"), "");
		String MTNG_PLC_NM = StringUtil.nvl(request.getParameter("MTNG_PLC_NM"), "");
		String WRK_SCTN_NM = StringUtil.nvl(request.getParameter("WRK_SCTN_NM"), "");
		String WRK_NM = StringUtil.nvl(request.getParameter("WRK_NM"), "");
		String WRK_TRGT_NM = StringUtil.nvl(request.getParameter("WRK_TRGT_NM"), "");
		String WRKOR_NO = StringUtil.nvl(request.getParameter("WRKOR_NO"), "");

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String UNQ_KY_VAL = pelsFormService.getLastUnqKey("EtcJobLastUnqNo");
		
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		paramMap.put("DIVS_CD", DIVS_CD);
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", PPCD);
		if("".equals(TST_UNQ_KY_VAL)) TST_UNQ_KY_VAL = "0";
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_VER_NO", PRCDOC_VER_NO);
		paramMap.put("FRM_CFY", FRM_CFY);
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("MTNG_DY", MTNG_DY.replaceAll("-", ""));
		paramMap.put("MTNG_TITL", MTNG_TITL); 
		paramMap.put("MTNG_HSMPR_ID", MTNG_HSMPR_ID);
		paramMap.put("MTNG_PLC_NM", MTNG_PLC_NM);
		paramMap.put("MTNG_PLC_NM", MTNG_PLC_NM);
		paramMap.put("WRK_SCTN_NM", WRK_SCTN_NM);
		paramMap.put("WRK_NM", WRK_NM);
		paramMap.put("WRK_TRGT_NM", WRK_TRGT_NM);
		paramMap.put("WRKOR_NO", WRKOR_NO);
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			
			if ("/JobMan_Insert_Ajax.do".equals(request.getRequestURI())) {
				pelsOutcomeService.insert("InsertEtcJob", paramMap);
				
				Iterator<String> iterator = mReq.getFileNames();
				while (iterator.hasNext()) {
					String uploadFileName = iterator.next();
					CommonsMultipartFile mFile = (CommonsMultipartFile) mReq.getFile(uploadFileName);
				
					String pelsPath = PELS_DIR;
					String upperPath = pelsPath + "/upload";
					
					File pelsFolder = new File(pelsPath);
	
					// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
					if (!pelsFolder.exists()) {
						pelsFolder.mkdir(); //폴더 생성합니다.
					}
					File upperFolder = new File(upperPath);
	
					// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
					if (!upperFolder.exists()) {
						upperFolder.mkdir(); //폴더 생성합니다.
					}
					/*
					 * 임시 상위폴더 체크 및 생성 종료...
					 */
					
					String folderName = "GE_MP_JOB_S";
					String uploadPath = upperPath + "/" + folderName + "/";
					File folder = new File(uploadPath);
					// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
					if (!folder.exists()) {
						folder.mkdir(); //폴더 생성합니다.
					}
				
					String orgFileName = mFile.getOriginalFilename();
		        
			        int index = orgFileName.lastIndexOf(".");
			        String fileExt = orgFileName.substring(index + 1);
			        orgFileName = orgFileName.substring(0, index);
		        
			        if (orgFileName != null && !orgFileName.isEmpty()) {
			        	orgFileName = orgFileName.replaceAll("\\.{2,}[/\\\\]", "");
			        	orgFileName = orgFileName.replaceAll("&", "");
			        }
				
					File file = null;
				
					String extName = "pdf";
					String ATFL_PHCL_NM = format.format(new Date())+"_"+ orgFileName;
					String newfileName = ATFL_PHCL_NM + "." + fileExt;
			        if (newfileName != null && !newfileName.equals("")) {
			        	if (newfileName.toLowerCase().endsWith(extName)) {
				            
			        		String srcFile;
			        		srcFile = uploadPath + newfileName;
			            	try {
			                    file = new File(srcFile);
			                    mFile.transferTo(file);
			                } catch (IOException e) {
			                    log.error("Error occured !!! Method :: uploadFile > {}, error > {}", folderName, e.getMessage(), e);
			                    throw e;
			                } 
			            	
			        	} else {
			        		log.error("Error occured !!! Method :: uploadFile > {}, extName checkFail... fileExt > {}, expectedFileExt > {}", folderName, fileExt, extName);
			        		throw new ServletException("");
			        	}
			        }
			        
					HashMap<String, Object> saveMap = new HashMap<String, Object>();
					saveMap.put("ATFL_UNQ_NO", ""); // 첨부파일고유번호
					saveMap.put("ATFL_GRUP_NM", "GE_MP_JOB_S");
					saveMap.put("UNQ_NO", UNQ_KY_VAL);
					saveMap.put("ATFL_ID", "1");
					saveMap.put("ATFL_TITL_NM", "");
					saveMap.put("ATFL_FEXT_NM", "pdf");
					
					saveMap.put("ATFL_PTH_NM", uploadPath);
					saveMap.put("ATFL_ORSRC_NM", orgFileName);
					saveMap.put("ATFL_PHCL_NM", ATFL_PHCL_NM);
					saveMap.put("ATFL_SZ", mFile.getSize());
					
					int ret = pelsFileService.insert("InsertFile", saveMap);
				}
						
				resultMsg = "등록이 완료되었습니다.";
			}
			else if ("/JobMan_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsOutcomeService.update("UpdateEtcJob", paramMap);
				resultMsg = "수정이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("procedureSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	@RequestMapping(value={"/Job_Insert_Ajax.do", "/Job_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Job_Insert_Ajax (HttpServletRequest request) throws Exception {
		Map<String, String> resultMap = new HashMap<String, String>();
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = StringUtil.nvl((String) session.getAttribute("LOGIN_DIVS_CD"), "");
		String PPCD = StringUtil.nvl((String) session.getAttribute("LOGIN_PPCD"), "");
		
		USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), USER_ID);
		USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), USER_NM);
		DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), DIVS_CD);
		PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), PPCD);
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), "");					// 고유번호 : 수정시
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");			// 작업전회의 서식 고유번호
		String PRCDOC_VER_NO = StringUtil.nvl(request.getParameter("PRCDOC_VER_NO"), "");
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), "JOB");
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), "");

		String MTNG_DY = StringUtil.nvl(request.getParameter("MTNG_DY"), "");
		String MTNG_TITL = StringUtil.nvl(request.getParameter("MTNG_TITL"), "");
		String MTNG_HSMPR_ID = StringUtil.nvl(request.getParameter("MTNG_HSMPR_ID"), "");
		String MTNG_PLC_NM = StringUtil.nvl(request.getParameter("MTNG_PLC_NM"), "");
		String WRK_SCTN_NM = StringUtil.nvl(request.getParameter("WRK_SCTN_NM"), "");
		String WRK_NM = StringUtil.nvl(request.getParameter("WRK_NM"), "");
		String WRK_TRGT_NM = StringUtil.nvl(request.getParameter("WRK_TRGT_NM"), "");
		String WRKOR_NO = StringUtil.nvl(request.getParameter("WRKOR_NO"), "");

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		paramMap.put("DIVS_CD", DIVS_CD);
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", PPCD);
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("PRCDOC_VER_NO", PRCDOC_VER_NO);
		paramMap.put("FRM_CFY", FRM_CFY);
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("MTNG_DY", MTNG_DY.replaceAll("-", ""));
		paramMap.put("MTNG_TITL", MTNG_TITL); 
		paramMap.put("MTNG_HSMPR_ID", MTNG_HSMPR_ID);
		paramMap.put("MTNG_PLC_NM", MTNG_PLC_NM);
		paramMap.put("MTNG_PLC_NM", MTNG_PLC_NM);
		paramMap.put("WRK_SCTN_NM", WRK_SCTN_NM);
		paramMap.put("WRK_NM", WRK_NM);
		paramMap.put("WRK_TRGT_NM", WRK_TRGT_NM);
		paramMap.put("WRKOR_NO", WRKOR_NO);
		paramMap.put("TST_UNQ_KY_VAL", "");
		paramMap.put("PRCDOC_NO", "");
		
		// 등록자
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String uri = request.getRequestURI();
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			
			if ("/Job_Insert_Ajax.do".equals(request.getRequestURI())) {
				UNQ_KY_VAL = pelsFormService.getLastUnqKey("EtcJobLastUnqNo");
				paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
				pelsOutcomeService.insert("InsertEtcJob", paramMap);
				
				// 
				// OZD파일을 복사한다.
				//
				String OzdPath = PELS_DIR;
				HashMap<String, Object> fileMap = new HashMap<String, Object>();
				
				fileMap.put("ATFL_GRUP_NM", "GE_MP_ETCFRM_M");
				fileMap.put("UNQ_NO", FRM_UNQ_KY_VAL);
				fileMap.put("ATFL_ID", "");
				
				try {
							
					List<Map> fileList = pelsFileService.getList("FileList", fileMap);
					
					if(fileList != null && fileList.size() > 0) {
						String srcPATH = OzdPath + "/ozd/" + fileList.get(0).get("ATFL_GRUP_NM").toString() + "/" + fileList.get(0).get("ATFL_PHCL_NM").toString() + ".ozd";
						String ATFL_PHCL_NM = format.format(new Date())+"_"+  fileList.get(0).get("ATFL_PHCL_NM").toString().substring(18);
						String tagPATH = OzdPath + "/upload/GE_MP_JOB_S/" + ATFL_PHCL_NM + ".ozd";
						
						HashMap<String, Object> saveMap = new HashMap<String, Object>();
						saveMap.put("ATFL_UNQ_NO", ""); // 첨부파일고유번호
						saveMap.put("ATFL_GRUP_NM", "GE_MP_JOB_S");
						saveMap.put("UNQ_NO", UNQ_KY_VAL);
						saveMap.put("ATFL_ID", "1");
						saveMap.put("ATFL_TITL_NM", "");
						saveMap.put("ATFL_FEXT_NM", "ozd");
						
						saveMap.put("ATFL_PTH_NM", OzdPath + "/upload/GE_MP_JOB_S/");
						saveMap.put("ATFL_ORSRC_NM", fileList.get(0).get("ATFL_ORSRC_NM").toString());
						saveMap.put("ATFL_PHCL_NM", ATFL_PHCL_NM);
						saveMap.put("ATFL_SZ", fileList.get(0).get("ATFL_SZ").toString());
						
						int ret = pelsFileService.insert("InsertFile", saveMap);		
						
						PELS_FileUtil.FileCopy(srcPATH, tagPATH);
					}
				} catch(Exception e) {
					log.error("getAtflTitlNm error: {}", e.getMessage(), e);
				}
				
				resultMsg = "등록이 완료되었습니다.";
			}
			else if ("/Job_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsOutcomeService.update("UpdateEtcJob", paramMap);
				resultMsg = "수정이 완료되었습니다.";
			}
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("procedureSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	
	/**
	 * 절차서(서식)관리 > 정주기시험 > 정주기시험 수정
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Job_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView JOb_Detail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = StringUtil.nvl((String) session.getAttribute("LOGIN_DIVS_CD"), "");
		String PPCD = StringUtil.nvl((String) session.getAttribute("LOGIN_PPCD"), "");
		
		USER_ID = StringUtil.nvl(request.getParameter("LOGIN_USER_ID"), USER_ID);
		USER_NM = StringUtil.nvl(request.getParameter("LOGIN_USER_NM"), USER_NM);
		DIVS_CD = StringUtil.nvl(request.getParameter("LOGIN_DIVS_CD"), DIVS_CD);
		PPCD = StringUtil.nvl(request.getParameter("LOGIN_PPCD"), PPCD);		
		
		
		String UNQ_KY_VAL = StringUtil.nvl(request.getParameter("UNQ_KY_VAL"), ""); 
		
		// 정주기시험 일정(GE_MP_SCHE_S) 조회
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("UNQ_KY_VAL", UNQ_KY_VAL);
		Map<String, String> EtcJobFormDetail = pelsOutcomeService.getDetail("EtcJobFormDetail", paramMap);
		
		if(EtcJobFormDetail != null) {
			mav.addObject("EtcJobFormDetail", EtcJobFormDetail); // 등록자명
		}
		
		mav.setViewName("/pels/outcome/Job_Detail");
		return mav;
	}	
	
	/**
	 * 선택된 절차서(서식)을 삭제한다.
	 * @param request
	 * @param attributes
	 * @return
	 */
	@RequestMapping(value="/Job_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Job_Delete_Ajax (HttpServletRequest request) {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		
		// 그룹명
		map.put("ATFL_GRUP_NM", AtflGrupNm.ETC_JOB_S);
		
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultMsg =  pelsFormLogicService.formDelete(map);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "정주기시험 서식 삭제에 실패하였습니다.";
			log.error("formDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
}
