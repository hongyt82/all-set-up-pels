package com.khnp.pels.outcome.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.enums.PrstsCfy;
import com.khnp.pels.outcome.service.PELSOutcomeService;

import common.util.ExcelUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;

/**
 * 결과관리 > 시험(점검)자료 이력정보
 * 시험(점검)관리 > 시험(점검)수행 모니터링 > 시험(점검)자료 이력
 * 시험(점검)관리 > 시험(점검)수행 모니터링 > 항목조회
 * 결과관리 > 정주기시험 > 시험(점검)자료 이력
 * 결과관리 > 점검관리(붙임) > 시험(점검)자료 이력
 * @author dev004
 *
 */
@Controller
public class PELSOutcomeHistoryController {

	private static final Logger log = LoggerFactory.getLogger(PELSOutcomeHistoryController.class);
	
	@Autowired
	private PELSOutcomeService pelsOutcomeService;
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 결과관리 > 시험(점검)자료이력정보
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_History_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView outcomeHistorySearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));		
		
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); // 시험고유키값
		String FRM_ID = StringUtil.nvl(request.getParameter("FRM_ID"), "");
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_TEST_NM = StringUtil.nvl(request.getParameter("SH_TEST_NM"), "");
		String SH_TITL_NM2 = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String SH_ITM_NM = StringUtil.nvl(request.getParameter("SH_ITM_NM"), "");
		
System.out.println("SH_TEST_NM : " + SH_TEST_NM);	
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("SH_PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("SH_TEST_NM", SH_TEST_NM);
		paramMap.put("SH_TITL_NM", SH_TITL_NM);
		paramMap.put("SH_ITM_NM", SH_ITM_NM);
		//paramMap.put("FRM_ID", FRM_ID);
		paramMap.put("FRM_ID", "");
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("OutcomeHistoryCount", paramMap); // 총 조회수
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
		
		ArrayList outcomeHistoryList = (ArrayList) pelsOutcomeService.getList("OutcomeHistoryList", paramMap);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsOutcomeService.getList("GetPlantCode", paramMap);
		mav.addObject("plantList", plantList);

		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		mav.addObject("outcomeHistoryList", outcomeHistoryList);
		
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);
		mav.addObject("SH_TEST_NM", SH_TEST_NM);
		mav.addObject("SH_TITL_NM", SH_TITL_NM);
		mav.addObject("SH_ITM_NM", SH_ITM_NM);

		// 검색조건 재입력
		mav.setViewName("/pels/outcome/Outcome_History_Search");
		return mav;
	}

	/**
	 * 시험(점검)관리 > 시험(점검)수행 모니터링 > 시험(점검)자료 이력
	 * 결과관리 > 정주기시험 > 시험(점검)자료 이력
	 * 결과관리 > 점검관리(붙임) > 시험(점검)자료 이력
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Main_History_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView outcomeMainHistorySearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "20"));		
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRCDOC_NM = StringUtil.nvl(request.getParameter("SH_PRCDOC_NM"), "");
		String CHCK_STRT_DT = StringUtil.nvl(request.getParameter("CHCK_STRT_DT"), "");
		String CHCK_END_DT = StringUtil.nvl(request.getParameter("CHCK_END_DT"), "");
		String SH_SORT = StringUtil.nvl(request.getParameter("SH_SORT"), "");
		
		String SH_TEST_NM = StringUtil.nvl(request.getParameter("SH_TEST_NM"), "");		
		String SH_ITM_NM = StringUtil.nvl(request.getParameter("SH_ITM_NM"), "");		
		
		
		
		String URL = StringUtil.nvl(request.getParameter("URL"), "");
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		
		Map<String, String> examDetail = pelsOutcomeService.getDetail("ExamDetail", paramMap);
		if(examDetail != null) {
			mav.addObject("examDetail", examDetail);
		}
		
		paramMap.put("FRM_ID", "");
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		paramMap.put("SH_PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("SH_TEST_NM", SH_TEST_NM);
		paramMap.put("SH_TITL_NM", SH_TITL_NM);
		paramMap.put("SH_ITM_NM", SH_ITM_NM);
		
		int TCNT = pelsOutcomeService.getCount("OutcomeHistoryCount", paramMap); // 총 조회수
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
		
		ArrayList outcomeHistoryList = (ArrayList) pelsOutcomeService.getList("OutcomeHistoryList", paramMap);
		
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("URL", URL);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);
		mav.addObject("SH_TITL_NM", SH_TITL_NM);
		mav.addObject("SH_ITM_NM", SH_ITM_NM);
		mav.addObject("SH_PRCDOC_NM", SH_PRCDOC_NM);
		mav.addObject("CHCK_STRT_DT", CHCK_STRT_DT);
		mav.addObject("CHCK_END_DT", CHCK_END_DT);
		mav.addObject("SH_SORT", SH_SORT);
		
		mav.addObject("SH_TEST_NM", SH_TEST_NM);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);		

		mav.addObject("outcomeHistoryList", outcomeHistoryList);
		
		mav.setViewName("/pels/outcome/Outcome_Main_History_Search");
		return mav;
	}
	

	@RequestMapping(value="/Outcome_ItemFME_Ozd_Input.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Outcome_Item_Ozd_Input (HttpServletRequest request) {
		
		ModelAndView mav = new ModelAndView();
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String UNQ_ID = StringUtil.nvl(request.getParameter("UNQ_ID"), "");
		
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		mav.addObject("UNQ_ID", UNQ_ID);
		
		mav.setViewName("/pels/outcome/Outcome_ItemFME_Ozd_Input");
		
		return mav;
	}
	
	/**
	 * 시험(점검)관리 > 시험(점검)수행 모니터링 > 시험(점검)자료 이력
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Item_History_M.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView OutcomeItemHistory (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		String FRM_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("FRM_UNQ_KY_VAL"), "");
		String FRM_ID = StringUtil.nvl(request.getParameter("FRM_ID"), "");
		
		paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
		paramMap.put("FRM_ID", FRM_ID);
		
		ArrayList OutcomeItemHistoryList = (ArrayList) pelsOutcomeService.getList("OutcomeItemHistoryList", paramMap);
		
		HashMap<String, Object> paramMap2 = new HashMap<String, Object>();
		paramMap2.put("OutcomeItemHistoryList", OutcomeItemHistoryList);
		JSONObject JSONDATA = new JSONObject(paramMap2);
		mav.addObject("JSONDATA", JSONDATA);
		mav.setViewName("/pels/Json");
		
		return mav;
	}

	/**
	 * 결과관리 > 시험(점검)자료이력정보 트랜드
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Chart_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView outcomeChart (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();		

		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); 	// 시험고유키값
		String FRM_ID = cleanXSS(StringUtil.nvl(request.getParameter("FRM_ID"), ""));			// 이폼서식ID		
		String TITL_NM = cleanXSS(StringUtil.nvl(request.getParameter("TITL_NM"), ""));			// 제목
		String TH1_ITM_NM = cleanXSS(StringUtil.nvl(request.getParameter("TH1_ITM_NM"), ""));	// 분류1
		String TH2_ITM_NM = cleanXSS(StringUtil.nvl(request.getParameter("TH2_ITM_NM"), ""));	// 분류2
		String TH3_ITM_NM = cleanXSS(StringUtil.nvl(request.getParameter("TH3_ITM_NM"), "")); 	// 분류3
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("FRM_ID", FRM_ID);		
		paramMap.put("TITL_NM", TITL_NM);
		paramMap.put("TH1_ITM_NM", TH1_ITM_NM);
		paramMap.put("TH2_ITM_NM", TH2_ITM_NM);
		paramMap.put("TH3_ITM_NM", TH3_ITM_NM);
		
		ArrayList outcomeChartList = (ArrayList) pelsOutcomeService.getList("OutcomeChartList", paramMap);	
		
		String ChartVal = "";
		
		for(int i=0; i<outcomeChartList.size(); i++) {
			Map<String, String> outcome  = (Map<String, String>)outcomeChartList.get(i);
			String sDate = outcome.get("FM_MSNT_DT");
			String sVal = outcome.get("AGMST_VAL");
			if(i > 0) ChartVal += ",";
			ChartVal += "{x:'" + sDate + "', y:'" + sVal + "'}";
		}

		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		mav.addObject("FRM_ID", FRM_ID);
		mav.addObject("TITL_NM", TITL_NM);
		mav.addObject("TH1_ITM_NM", TH1_ITM_NM);
		mav.addObject("TH2_ITM_NM", TH2_ITM_NM);
		mav.addObject("TH3_ITM_NM", TH3_ITM_NM);
		mav.addObject("outcomeChartList", outcomeChartList);	
		mav.addObject("jsonArray", new JSONArray(outcomeChartList).toString());	
		mav.addObject("ChartVal", ChartVal);	

		mav.setViewName("/pels/popup/Outcome_Chart");
							
		return mav;
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
    
	@RequestMapping("/Outcome_History_Excel.do")
	@ResponseBody
	public byte[] downExcelFile (HttpServletRequest request, HttpServletResponse response) throws UnsupportedEncodingException {
		String format = "yyyyMMddHHmmss";
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		Calendar c = Calendar.getInstance();
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), ""); // 시험고유키값
		String FRM_ID = StringUtil.nvl(request.getParameter("FRM_ID"), "");
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_TEST_NM = StringUtil.nvl(request.getParameter("SH_TEST_NM"), "");
		String SH_TITL_NM2 = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("SH_TITL_NM"), ""));
		
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
		paramMap.put("SH_PRCDOC_NO", SH_PRCDOC_NO);
		paramMap.put("SH_TEST_NM", SH_TEST_NM);
		paramMap.put("SH_TITL_NM", SH_TITL_NM);
		//paramMap.put("FRM_ID", FRM_ID);
		paramMap.put("FRM_ID", "");
		
		List exList = new ArrayList();
		exList = pelsOutcomeService.getList("OutcomeHistoryList_Excel", paramMap);
		
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
		
		sSheetName = "시험결과_데이터";
		arrWidth.add(6000);
		arrWidth.add(15000);
		arrWidth.add(15000);
		arrWidth.add(20000);
		arrWidth.add(3000);
		arrWidth.add(3000);
		arrWidth.add(5000);
		
	    header.add("절차서번호");
	    header.add("시험명");
	    header.add("제목명");
	    header.add("분류");
	    header.add("기록값");
	    header.add("기록자");
	    header.add("기록일시");
	    
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
