package com.khnp.pels.system.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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

import common.util.ExcelUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSProcedureController {

	private static final Logger log = LoggerFactory.getLogger(PELSProcedureController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 시스템관리 > 절차서관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Proc_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView procedureSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));		
		
		//todo: 유저 세션, 조회조건 부서관련 초기세팅, ...
		HttpSession session = request.getSession();
		String LOGIN_DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		String LOGIN_PPCD_NM = (String) session.getAttribute("LOGIN_PPCD_NM");
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String PPCD = StringUtil.nvl(request.getParameter("SH_PPCD"), LOGIN_PPCD);
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		paramMap.put("PRCDOC_CFY", StringUtil.nvl(PRCDOC_CFY,""));
		paramMap.put("PRCDOC_NO", StringUtil.nvl(PRCDOC_NO, ""));
		paramMap.put("PRCDOC_NM", StringUtil.nvl(PRCDOC_NM,""));
		
		LocalDate localDate = LocalDate.now();

		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsProcedureService.getCount("ProcedureCount", paramMap); // 총 조회수
		int TOTALPAGE = 0;
		if(Math.floorMod(TCNT, LISTCNT) > 0) {
			TOTALPAGE = (TCNT/LISTCNT) + 1;
		} else {
			TOTALPAGE = (TCNT/LISTCNT);
		}

		if((PAGE / LISTCNT) > 0) {
			if(Math.floorMod(PAGE, LISTCNT) > 0) {
				STARTPAGE = (((PAGE / LISTCNT)) * LISTCNT) + 1;
			} else {
				STARTPAGE = (((PAGE / LISTCNT) - 1) * LISTCNT) + 1;
			}
		} else {
			STARTPAGE = ((PAGE / LISTCNT) * LISTCNT) + 1;
		}
		
		ENDPAGE = STARTPAGE + LISTCNT - 1;
		if (ENDPAGE > TOTALPAGE) {
			ENDPAGE = TOTALPAGE;
		}
		
		ArrayList procedureList = (ArrayList) pelsProcedureService.getList("ProcedureList", paramMap); // 정주기시험 리스트
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsProcedureService.getList("GetPlantCode", paramMap);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("SH_PRCDOC_NO", PRCDOC_NO);
		mav.addObject("SH_PRCDOC_NM", PRCDOC_NM);
		mav.addObject("SH_PPCD", PPCD);
		
		mav.addObject("procedureList", procedureList);
		mav.addObject("plantList", plantList);
		
		mav.setViewName("/pels/system/Proc_Search");
		return mav;
	}
	
	/**
	 * 시스템관리 > 절차서관리 > 절차서 등록 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Proc_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView procedureInput (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		mav.addObject("REGPR_NM", USER_NM);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		
		mav.setViewName("/pels/system/Proc_Input");
		return mav;
	}

	/**
	 * 시스템관리 > 절차서관리 > 절차서 수정 
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Proc_Detail.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView procedureDetail (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		HttpSession session = request.getSession();
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		
		String PRCDOC_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), "");
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		Map<String, String> scheduleDetail = pelsProcedureService.getDetail("ProcedureDetail", paramMap);
		
		mav.addObject("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL); // 고유키값
		
		if(scheduleDetail != null) {
			mav.addObject("Detail", scheduleDetail); 
		}
		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		
		mav.setViewName("/pels/system/Proc_Detail");
		return mav;
	}
	
	/**
	 * 절차서를 저장한다.
	 * @param request
	 * @return
	 * @throws ServletException
	 */
	@RequestMapping(value={"/Proc_Insert_Ajax.do", "/Proc_Update_Ajax.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> procedureSave (HttpServletRequest request) throws Exception {
		System.out.println("Proc_Insert_Ajax or Proc_Update_Ajax");
		Map<String, String> resultMap = new HashMap<String, String>();
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD"); 	// 본부코드
		String PPCD = (String) session.getAttribute("LOGIN_PPCD");			// 발전소코드
		
		String PRCDOC_UNQ_KY_VAL = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_UNQ_KY_VAL"), "")); // 절차서고유키값
		
		String PRCDOC_NO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_NO"), "")); 
		String PRCDOC_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_NM"), "")); 
		String DOC_TYP = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("DOC_TYP"), "")); 
		String DOC_PART_NO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("DOC_PART_NO"), "")); 
		String RRD_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("RRD_CFY"), "")); 
		String FNCLC_ID = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("FNCLC_ID"), "")); 
		String ATCT_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("ATCT_NM"), "")); 
		String PRCDOC_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRCDOC_CFY"), ""));
		String MNTRG_YN = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("MNTRG_YN"), ""));

		String AUCR_YN = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("AUCR_YN"), ""));
		String APRV_YN_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_YN_CFY"), ""));
		String APRV_STEP_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("APRV_STEP_CFY"), ""));
		
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		paramMap.put("PRCDOC_UNQ_KY_VAL", PRCDOC_UNQ_KY_VAL);
		
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		paramMap.put("DOC_TYP", DOC_TYP);
		paramMap.put("DOC_PART_NO", DOC_PART_NO);
		paramMap.put("RRD_CFY", RRD_CFY);
		paramMap.put("FNCLC_ID", FNCLC_ID);
		paramMap.put("ATCT_NM", ATCT_NM);
		paramMap.put("MNTRG_YN", MNTRG_YN);

		paramMap.put("AUCR_YN", AUCR_YN);
		paramMap.put("APRV_YN_CFY", APRV_YN_CFY);
		paramMap.put("APRV_STEP_CFY", APRV_STEP_CFY);
		
		paramMap.put("DIVS_CD", StringUtil.nvl(DIVS_CD, ""));
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		paramMap.put("REGPR_ID", StringUtil.nvl(USER_ID, ""));
		paramMap.put("REGPR_NM", StringUtil.nvl(USER_NM, ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			if ("/Proc_Insert_Ajax.do".equals(request.getRequestURI())) {
				pelsProcedureService.insert("InsertProcedure", paramMap);
				resultMsg = "등록이 완료되었습니다.";
			}
			else if ("/Proc_Update_Ajax.do".equals(request.getRequestURI())) {
				pelsProcedureService.update("UpdateProcedure", paramMap);
				resultMsg = "수정이 완료되었습니다.";
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
	 * 선택된 절차서을 삭제한다.
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Proc_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> procedureDelete (HttpServletRequest request) {
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		
		int resultCnt = 0;	
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultCnt = pelsProcedureService.delete("DeleteProcedure", map);	
			resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "절차서 삭제에 실패하였습니다.";
			log.error("procedureDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "procDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	/**
	 * 절차서관리 팝업
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Proc_Popup.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView procedurePopupSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 부서관련 초기세팅, ...
		HttpSession session = request.getSession();
		String DIVS_CD = (String) session.getAttribute("LOGIN_DIVS_CD");
		String LOGIN_PPCD = (String) session.getAttribute("LOGIN_PPCD");
		
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));		
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		String PPCD = StringUtil.nvl(request.getParameter("PPCD"), LOGIN_PPCD);

		
		// 등록자
		paramMap.put("DIVS_CD", StringUtil.nvl(DIVS_CD, ""));
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsProcedureService.getCount("ProcedureCount", paramMap); // 총 조회수
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

		ArrayList procedureList = (ArrayList) pelsProcedureService.getList("ProcedureList", paramMap); // 정주기시험 리스트
		
		// 검색조건 재입력
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("PRCDOC_NO", PRCDOC_NO);
		mav.addObject("PRCDOC_NM", PRCDOC_NM);
		
		mav.addObject("procedureList", procedureList);
		mav.addObject("jsonArray", new JSONArray(procedureList).toString());
		
		mav.setViewName("/pels/popup/Proc_Popup");
		return mav;
	}
	
	@RequestMapping("/Proc_Excel.do")
	@ResponseBody
	public byte[] downExcelFile (HttpServletRequest request, HttpServletResponse response) throws UnsupportedEncodingException {
		String format = "yyyyMMddHHmmss";
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		Calendar c = Calendar.getInstance();
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String PPCD = StringUtil.nvl(request.getParameter("SH_PPCD"), "");
		
		if(PPCD == null || "".equals(PPCD)) PPCD = "2330";
		paramMap.put("PPCD", StringUtil.nvl(PPCD, ""));
		paramMap.put("PRCDOC_CFY", StringUtil.nvl(PRCDOC_CFY,""));
		paramMap.put("PRCDOC_NO", StringUtil.nvl(PRCDOC_NO, ""));
		paramMap.put("PRCDOC_NM", StringUtil.nvl(PRCDOC_NM,""));
		
		List exList = new ArrayList();
		exList = pelsProcedureService.getList("ProcedureList_Excel", paramMap);
		
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
			sSheetName = "정주기시험 절차서";
			arrWidth.add(6000);
			arrWidth.add(15000);
			arrWidth.add(6000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			
		    header.add("절차서번호");
		    header.add("절차서명");
		    header.add("절차서기능위치");
		    header.add("LDM최종버젼");
		    header.add("서식최종버젼");
		    header.add("등록일");
		    header.add("등록자");
		    header.add("DB갯수");
		}
		else {
			sSheetName = "정주기시험 절차서";
			arrWidth.add(6000);
			arrWidth.add(15000);
			arrWidth.add(15000);
			arrWidth.add(6000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			arrWidth.add(3000);
			
		    header.add("절차서번호");
		    header.add("절차서명");
		    header.add("점검지명");
		    header.add("절차서기능위치");
		    header.add("LDM최종버젼");
		    header.add("서식최종버젼");
		    header.add("등록일");
		    header.add("등록자");
		    header.add("QR갯수");
		}
	    
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
    
	
	
}
