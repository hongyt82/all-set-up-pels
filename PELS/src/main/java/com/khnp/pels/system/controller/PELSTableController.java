package com.khnp.pels.system.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.support.RequestContextUtils;

import com.khnp.pels.system.service.PELSProcedureService;

import common.util.ExcelUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSTableController {

	private static final Logger log = LoggerFactory.getLogger(PELSTableController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	
	/**
	 * 시스템관리 > 테이블 정보 관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Table_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView tableSearch (HttpServletRequest request) {
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
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsProcedureService.getCount("TableCount", paramMap); // 총 조회수
		
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
		
		ArrayList tableList = (ArrayList) pelsProcedureService.getList("TableList", paramMap);		// 테이블 목록			
				
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);		
		
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("tableList", tableList);
		mav.setViewName("/pels/system/Table_Search");
		
		return mav;
	}
	
	@RequestMapping(value = "Table_Detail_Search.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> tableDetailSearch(HttpServletRequest request) {
		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		String tableName = StringUtil.nvl(request.getParameter("TABLE_NAME"), "");
		
		paramMap.put("TABLE_NAME", StringUtil.nvl(tableName, ""));

		ArrayList tableDetail = (ArrayList) pelsProcedureService.getList("TableDetail", paramMap);
		Map resultMap = new HashMap<String, Object>();
		
		resultMap.put("tableDetail", tableDetail);
		resultMap.put("result", "success");

		return resultMap;
	}
	
	@RequestMapping(value = "Table_List.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> GetTableList(HttpServletRequest request) {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		List tableList = (ArrayList) pelsProcedureService.getList("TableList", null);

		resultMap.put("tableList", tableList);

		return resultMap;
	}	
	
	@RequestMapping(value = "ColList.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> GetColList(HttpServletRequest request) {
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		Map<String, Object> resultMap = new HashMap<String, Object>();

		String tableName = StringUtil.nvl(request.getParameter("TABLE_NAME"), "");
		paramMap.put("TABLE_NAME", StringUtil.nvl(tableName, ""));

		List colList = (ArrayList) pelsProcedureService.getList("TableDetail", paramMap);

		resultMap.put("colList", colList);

		return resultMap;
	}	
	
	@RequestMapping(value= "/Table_Data_Ajax.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> TableDataSearch(HttpServletRequest request, @RequestParam HashMap<String, Object> requestMap) {
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		Map<String, Object> resultMap = new HashMap<String, Object>();

		String tableName = StringUtil.nvl(request.getParameter("TABLE_NAME"), "");
		paramMap.put("TABLE_NAME", StringUtil.nvl(tableName, ""));
		
		int PCNT = 20;
		int PAGE = Integer.parseInt(jsonXssFilter.cleanXSS(StringUtil.nvl((String)requestMap.get("PAGE"), "1")));
		int STARTPAGE = Integer.parseInt(jsonXssFilter.cleanXSS(StringUtil.nvl((String)requestMap.get("STARTPAGE"), "1")));
		int ENDPAGE = Integer.parseInt(jsonXssFilter.cleanXSS(StringUtil.nvl((String)requestMap.get("ENDPAGE"), Integer.toString(PCNT))));
		int LISTCNT = Integer.parseInt(jsonXssFilter.cleanXSS(StringUtil.nvl((String)requestMap.get("LISTCNT"), "20")));
		
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		int TCNT = pelsProcedureService.getCount("TableDataCount", paramMap); // 총 조회수
		
		ArrayList TableHeaderList = (ArrayList) pelsProcedureService.getList("TableHeaderList", paramMap);	// 테이블 헤더정보		
		ArrayList TableDataList = (ArrayList) pelsProcedureService.getList("TableDataList", paramMap);		// 테이블 데이터
		
		int TOTALPAGE = 0;
		if (Math.floorMod(TCNT, LISTCNT) > 0) {
			TOTALPAGE = (TCNT/LISTCNT) + 1;
		} else {
			TOTALPAGE = (TCNT/LISTCNT);
		}

		if ((PAGE / PCNT) > 0) {
			if (Math.floorMod(PAGE, PCNT) > 0) {
				STARTPAGE = (((PAGE / PCNT)) * PCNT) + 1;
			} else {
				STARTPAGE = (((PAGE / PCNT) - 1) * PCNT) + 1;
			}
		} else {
			STARTPAGE = ((PAGE / PCNT) * PCNT) + 1;
		}
		
		ENDPAGE = STARTPAGE + (PCNT-1);
		
		if (ENDPAGE > TOTALPAGE) {
			ENDPAGE = TOTALPAGE;
		}		
		
		resultMap.put("TCNT", TCNT);
		resultMap.put("PAGE", PAGE);
		resultMap.put("TOTALPAGE", TOTALPAGE);
		resultMap.put("STARTPAGE", STARTPAGE);
		resultMap.put("ENDPAGE", ENDPAGE);
		resultMap.put("LISTCNT", LISTCNT);		
		resultMap.put("TableHeaderList", TableHeaderList);
		resultMap.put("TableDataList", TableDataList);
		
		return resultMap;
	}	
	
	@RequestMapping(value= {"/Table_Data_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView tableDataSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		mav.setViewName("/pels/system/Table_Data_Search");
		
		return mav;
	}
	
	@RequestMapping("/Table_Data_Excel.do")
	@ResponseBody
	public byte[] downExcelFile (HttpServletRequest request, HttpServletResponse response) throws UnsupportedEncodingException {
		String format = "yyyyMMddHHmmss";
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		Calendar c = Calendar.getInstance();
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();

		String tableName = StringUtil.nvl(request.getParameter("TABLE_NAME"), "");
		String tableDesc = StringUtil.nvl(request.getParameter("TABLE_DESC"), "");
		
		paramMap.put("TABLE_NAME", StringUtil.nvl(tableName, ""));
	
		ArrayList exHeader = (ArrayList) pelsProcedureService.getList("TableHeaderList", paramMap);	// 테이블 헤더
		ArrayList exList = (ArrayList) pelsProcedureService.getList("TableDataExcelDown", paramMap);	// 테이블 데이터
		
		List<Object> header = new ArrayList<Object>();
		List<Object> headerDesc = new ArrayList<Object>();
		List<List<Object>> data = new ArrayList<List<Object>>();
		
		String sSheetName = tableName;
		List<Integer> arrWidth = new ArrayList<Integer>();
		
		for (int j = 0; j < exHeader.size(); j++) {
			Map<String, Object> map = (LinkedHashMap<String, Object>) exHeader.get(j);
			Iterator iterator = map.keySet().iterator();
			String key = (String) iterator.next();
			
			arrWidth.add(6000);
			header.add(map.get("COL_DESC"));
			headerDesc.add(map.get("COL_NAME"));
		}    	
		
		for (int i = 0; i < exList.size(); i++){	
	    	Map<String, Object> map = (LinkedHashMap<String, Object>) exList.get(i);
	    	
	    	Iterator iterator = map.keySet().iterator();
	    	Iterator Headeritr = headerDesc.iterator();
    		List<Object> obj = new ArrayList<Object>();		    			    
    		
    		while(Headeritr.hasNext()){
        		String key = (String) Headeritr.next();
        		obj.add(String.valueOf(map.get(key)));
        	}
    		
    		data.add(obj);
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
