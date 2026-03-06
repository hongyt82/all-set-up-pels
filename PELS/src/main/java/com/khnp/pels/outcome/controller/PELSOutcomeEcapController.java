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
public class PELSOutcomeEcapController {
	private static final Logger log = LoggerFactory.getLogger(PELSOutcomeEcapController.class);
	
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
	 * 결과관리 > 정주기시험
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Outcome_Ecap_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView outcomeEcapSearch (HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		//todo: 유저 세션, 조회조건 초기세팅, ...
		// 시험시작, 종료일자 초기세팅
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.plusDays(-30);
		LocalDate endDate = nowDate;
		
		// 페이지 처리 항목
		int PAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("PAGE"), "1"));
		int STARTPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("STARTPAGE"), "1"));
		int ENDPAGE = Integer.parseInt(StringUtil.nvl(request.getParameter("ENDPAGE"), "20"));
		int LISTCNT = Integer.parseInt(StringUtil.nvl(request.getParameter("LISTCNT"), "15"));		
		
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		String PRCDOC_NO = StringUtil.nvl(request.getParameter("PRCDOC_NO"), "");
		String PRCDOC_NM = StringUtil.nvl(request.getParameter("PRCDOC_NM"), "");
		String TITL_NM = StringUtil.nvl(request.getParameter("TITL_NM"), "");
		
		String CHCK_STRT_DT = StringUtil.nvl(request.getParameter("CHCK_STRT_DT"), startDate.format(formatter)); // 시험시작일자
		String CHCK_END_DT  = StringUtil.nvl(request.getParameter("CHCK_END_DT"), endDate.format(formatter));    // 시험종료일자
		
		paramMap.put("PRCDOC_NO", PRCDOC_NO);
		paramMap.put("PRCDOC_NM", PRCDOC_NM);
		paramMap.put("TITL_NM", TITL_NM);
		
		paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT.replaceAll("-", ""));
		paramMap.put("CHCK_END_DT", CHCK_END_DT.replaceAll("-", ""));
		paramMap.put("PRCDOC_CFY", PRCDOC_CFY);
		paramMap.put("PRSTS_CFY", PrstsCfy.COMPLETE.getCode()); // 진행상태구분 R:준비, F:수행, S:정지, C:완료
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		int TCNT = pelsOutcomeService.getCount("EcapCount", paramMap);
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
		
		ArrayList outcomeList = (ArrayList) pelsOutcomeService.getList("EcapList", paramMap);
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);		
		mav.addObject("outcomeList", outcomeList);
		
		paramMap.put("PWPL_CFY", "4");
		ArrayList plantList = (ArrayList)pelsOutcomeService.getList("GetPlantCode", paramMap);
		mav.addObject("plantList", plantList);
		
		// 검색조건 재입력
		mav.addObject("PRCDOC_NO", PRCDOC_NO);		
		mav.addObject("PRCDOC_NM", PRCDOC_NM);		
		mav.addObject("TITL_NM", TITL_NM);		
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);		
		mav.addObject("CHCK_STRT_DT", CHCK_STRT_DT);
		mav.addObject("CHCK_END_DT", CHCK_END_DT);
		
		mav.setViewName("/pels/outcome/Outcome_Ecap_Search");
		return mav;
	}
}
