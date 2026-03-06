package com.khnp.pels.system.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.support.RequestContextUtils;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.FrmCfy;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;
import com.khnp.pels.system.service.PELSProcedureService;

import common.util.HttpConnectionUtil;
import common.util.PELS_FileUtil;
import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSMessageController {

	private static final Logger log = LoggerFactory.getLogger(PELSMessageController.class);

	@Autowired
	private PELSProcedureService pelsProcedureService;
	
	@Autowired
	private PELSFormLogicService pelsFormLogicService;
	
	@Autowired
	private PELSFormService pelsFormService;
	
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	/**
	 * 시스템관리 > 절차서관리
	 * @param request
	 * @return
	 */
	@RequestMapping(value= {"/Message_Search.do"}, method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView boardSearch (HttpServletRequest request) {
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
		
		String SH_TITL_NM = StringUtil.nvl(request.getParameter("SH_TITL_NM"), "");
		String TST_UNQ_KY_VAL = StringUtil.nvl(request.getParameter("TST_UNQ_KY_VAL"), "");
		String PRCDOC_CFY = StringUtil.nvl(request.getParameter("PRCDOC_CFY"), "");
		
		// 페이지별로 가져오기
		int DISPSTART = 0, DISPEND = 0;
		DISPSTART = ((PAGE - 1)) * LISTCNT + 1;
		DISPEND = PAGE * LISTCNT;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		paramMap.put("SH_TITL_NM", SH_TITL_NM);
		paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);

		int TCNT = pelsProcedureService.getCount("MessageCount2", paramMap); // 총 조회수
		
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
		
		ArrayList boardList = (ArrayList) pelsProcedureService.getList("MessageList2", paramMap); // 정주기시험 리스트
		
		mav.addObject("TCNT", TCNT);
		mav.addObject("PAGE", PAGE);
		mav.addObject("TOTALPAGE", TOTALPAGE);
		mav.addObject("STARTPAGE", STARTPAGE);
		mav.addObject("ENDPAGE", ENDPAGE);
		mav.addObject("LISTCNT", LISTCNT);
		
		mav.addObject("SH_TITL_NM", SH_TITL_NM);
		mav.addObject("PRCDOC_CFY", PRCDOC_CFY);
		mav.addObject("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);

		mav.addObject("MessageList", boardList);
		
		mav.setViewName("/pels/system/Message_Search");
		
		return mav;
	}
	
}
