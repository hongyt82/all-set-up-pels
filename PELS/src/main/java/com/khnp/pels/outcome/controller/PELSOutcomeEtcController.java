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

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileItem;
import org.json.JSONObject;
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

import common.util.StringUtil;
import common.xss.JsonXssFilter;
import common.util.PELS_FileUtil;

/**
 * 결과관리 > 정주기시험
 * 결과관리 > 점검관리(붙임)
 * 결과관리 > 일반양식
 * @author dev004
 *
 */
@Controller
public class PELSOutcomeEtcController {
	private static final Logger log = LoggerFactory.getLogger(PELSOutcomeEtcController.class);
	
	@Autowired
	private PELSFileService pelsFileService;	
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	@Autowired
	private PELSOutcomeService pelsOutcomeService;
	
	private final SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmssSSS", java.util.Locale.KOREA);
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 결과관리 > 일반양식
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Etc_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView etcOutcomeSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));
		
		String FRM_NM = StringUtil.nvl(request.getParameter("FRM_NM"), ""); 	// 제목
		String FRM_CFY = StringUtil.nvl(request.getParameter("FRM_CFY"), ""); 	// 제목
		
		paramMap.put("FRM_NM", FRM_NM);
		paramMap.put("REGPR_NM", "");
		paramMap.put("FRM_CFY", FRM_CFY);
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("EtcHistoryFormCount", paramMap); // 총 조회수
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
		
		ArrayList etcOutcomeList = (ArrayList) pelsOutcomeService.getList("EtcHistoryFormList", paramMap);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsOutcomeService.getList("GetPlantCode", paramMap);
		mav.addObject("plantList", plantList);
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);

		mav.addObject("etcOutcomeList", etcOutcomeList);
		
		// 검색조건 재입력
		mav.addObject("FRM_NM", FRM_NM);
		
		mav.setViewName("/pels/outcome/Outcome_Etc_Search");
		
		return mav;
	}
	
	/**
	 * 선택된 절차서(서식)을 삭제한다.
	 * @param request
	 * @param attributes
	 * @return
	 */
	@RequestMapping(value="/Outcome_Etc_Delete_Ajax.do", method = {RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Outcome_Etc_Delete_Ajax (HttpServletRequest request) {
		
		Map<String, String> resultMap = new HashMap<String, String>();
		String CHK_ITEM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHK_ITEM"), ""));
		
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("CHK_ITEMS", CHK_ITEM);
		
		// 그룹명
		map.put("ATFL_GRUP_NM", AtflGrupNm.ETC_FRM_S);
		
		String resultMsg =  "";
		String resultCd = "false";
		
		try {
			resultMsg =  pelsFormLogicService.formDelete(map);
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "삭제에 실패하였습니다.";
			log.error("formDelete error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "formDelete");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		
		return resultMap;
	}
	
	
}
