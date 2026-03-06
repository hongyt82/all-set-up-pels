package com.khnp.pels.common.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.util.FileCopyUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;


import com.google.gson.JsonObject;
import com.khnp.pels.common.dto.CommonFileDTO;
import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.service.PELSFileLogicService;
import com.khnp.pels.form.service.PELSFormLogicService;
import com.khnp.pels.form.service.PELSFormService;

import common.xss.JsonXssFilter;
import common.util.*;

@Controller
public class PELSSchedulerController {
	private static final Logger log = LoggerFactory.getLogger(PELSSchedulerController.class);

	@Autowired
	private PELSFormService pelsFormService;	

	@Resource(name = "utilProperties")
	private Properties utilProperties;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	@Component
	public class Scheduler {
		// 0 10 0 * * *
		// 초 분 시 일 월 요일
		//@Scheduled(cron= "0 10 * * * *")
		@Scheduled(cron= "0 10 0 * * *")
		public void autoUpdate() {
			JobRun();
		}
	}
	
	public void JobRun()
	{
		String format = "yyyyMMdd";
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		
		Calendar c = Calendar.getInstance();
		
		String MONTH = (c.get(Calendar.MONTH) + 1) + "";
		String WEEK = (c.get(Calendar.WEEK_OF_MONTH)) + "";
		
		LocalDate localDate = LocalDate.now();
		DayOfWeek dayOfWeek = localDate.getDayOfWeek();
		String WeekName = dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.KOREAN);
		LocalDate lastDayOfMonth = localDate.with(TemporalAdjusters.lastDayOfMonth());
		
		c.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
		
		c.set(Calendar.DAY_OF_WEEK, Calendar.SATURDAY);
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		ArrayList schedules = (ArrayList) pelsFormService.getList("GetSchedule", paramMap);
		
		for(int i=0; i<schedules.size(); i++) {
			Map<String, String> schedule = (Map<String, String>)schedules.get(i);
		
			String FRM_UNQ_KY_VAL = schedule.get("FRM_UNQ_KY_VAL");
			String ATCT_NM = schedule.get("ATCT_NM");
			String RRD_CFY = schedule.get("RRD_CFY");
			
			if("주".equals(RRD_CFY) && "월".equals(WeekName)) {
				paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				c.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
				paramMap.put("CHCK_STRT_DT", sdf.format(c.getTime()));
				c.set(Calendar.DAY_OF_WEEK, Calendar.FRIDAY);
				paramMap.put("CHCK_END_DT", sdf.format(c.getTime()));
				//paramMap.put("TITL_NM", "[" + localDate.getYear() + "년 " + getCurrentWeekOfMonth(localDate) + "] " + ATCT_NM);
				c.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
				paramMap.put("TITL_NM", ATCT_NM + sdf.format(c.getTime()));
				paramMap.put("CHKPR_ID", "");
				paramMap.put("CHKPR_FNM", "시스템");
				paramMap.put("CNMR_ID", "");
				paramMap.put("CNMR_FNM", "");
				paramMap.put("ATWT_ID", "");
				paramMap.put("ATWT_FNM", "");
				paramMap.put("WRKOR_NO", "");
				paramMap.put("ATWT_PPL_CNT", "");
				paramMap.put("ATWT_RQST_YN", "");
				paramMap.put("PRSTS_CFY", "A");
				paramMap.put("REGPR_ID", "M1EU0004");
				paramMap.put("REGPR_NM", "SYSTEM");
				
				int TCNT = pelsFormService.getCount("ExamSchedulerCount", paramMap); // 총 조회수
				if(TCNT == 0) {
					String TST_UNQ_KY_VAL = pelsFormService.getLastUnqKey("ExamLastUnqNo");
					paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
					pelsFormService.insert("InsertExam", paramMap);
				}
			}
			
			if("월".equals(RRD_CFY) && "1".equals(localDate.getDayOfMonth()+"")) {
				String CHCK_STRT_DT = localDate.withDayOfMonth(1) + "";
				String CHCK_END_DT = localDate.withDayOfMonth(localDate.lengthOfMonth()) + "";
				
				paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT.replaceAll("-", ""));
				paramMap.put("CHCK_END_DT", CHCK_END_DT.replaceAll("-", ""));
				paramMap.put("TITL_NM", "[" + localDate.getYear() + "년 " + localDate.getMonthValue() + "월] " + ATCT_NM);
				paramMap.put("CHKPR_ID", "");
				paramMap.put("CHKPR_FNM", "시스템");
				paramMap.put("CNMR_ID", "");
				paramMap.put("CNMR_FNM", "");
				paramMap.put("ATWT_ID", "");
				paramMap.put("ATWT_FNM", "");
				paramMap.put("WRKOR_NO", "");
				paramMap.put("ATWT_PPL_CNT", "");
				paramMap.put("ATWT_RQST_YN", "");
				paramMap.put("PRSTS_CFY", "A");
				paramMap.put("REGPR_ID", "M1EU0004");
				paramMap.put("REGPR_NM", "SYSTEM");
				int TCNT = pelsFormService.getCount("ExamSchedulerCount", paramMap);
				if(TCNT == 0) {
					String TST_UNQ_KY_VAL = pelsFormService.getLastUnqKey("ExamLastUnqNo");
					paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
					pelsFormService.insert("InsertExam", paramMap);
				}
			}
			
			if("월2".equals(RRD_CFY) && ("1".equals(localDate.getDayOfMonth()+"") || "16".equals(localDate.getDayOfMonth()+""))) {
				String CHCK_STRT_DT = localDate.withDayOfMonth(1) + "";
				String CHCK_END_DT = localDate.withDayOfMonth(localDate.lengthOfMonth()) + "";
				String TITL_NM = "";
				
				if("1".equals(localDate.getDayOfMonth()+"")) {
					CHCK_STRT_DT = localDate.withDayOfMonth(1) + "";
					CHCK_END_DT = localDate.withDayOfMonth(15) + "";
					TITL_NM = localDate.getYear() + "년 " + localDate.getMonthValue() + "월초";
				}
				else if("16".equals(localDate.getDayOfMonth()+"")) {
					CHCK_STRT_DT = localDate.withDayOfMonth(16) + "";
					CHCK_END_DT = localDate.withDayOfMonth(localDate.lengthOfMonth()) + "";
					TITL_NM = localDate.getYear() + "년 " + localDate.getMonthValue() + "월말";
				}
				paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT.replaceAll("-", ""));
				paramMap.put("CHCK_END_DT", CHCK_END_DT.replaceAll("-", ""));
				paramMap.put("TITL_NM", ATCT_NM + " " + TITL_NM);
				paramMap.put("CHKPR_ID", "");
				paramMap.put("CHKPR_FNM", "시스템");
				paramMap.put("CNMR_ID", "");
				paramMap.put("CNMR_FNM", "");
				paramMap.put("ATWT_ID", "");
				paramMap.put("ATWT_FNM", "");
				paramMap.put("WRKOR_NO", "");
				paramMap.put("ATWT_PPL_CNT", "");
				paramMap.put("ATWT_RQST_YN", "");
				paramMap.put("PRSTS_CFY", "A");
				paramMap.put("REGPR_ID", "M1EU0004");
				paramMap.put("REGPR_NM", "SYSTEM");
				int TCNT = pelsFormService.getCount("ExamSchedulerCount", paramMap);
				if(TCNT == 0) {
					String TST_UNQ_KY_VAL = pelsFormService.getLastUnqKey("ExamLastUnqNo");
					paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
					
					pelsFormService.insert("InsertExam", paramMap);
				}
			}
		}
	}
	
	@RequestMapping(value = "Scheduler.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> Scheduler(HttpServletRequest request) {
		
		String format = "yyyyMMdd";
		SimpleDateFormat sdf = new SimpleDateFormat(format);
		
		
		Calendar c = Calendar.getInstance();
		
		String MONTH = (c.get(Calendar.MONTH) + 1) + "";
		String WEEK = (c.get(Calendar.WEEK_OF_MONTH)) + "";
		
		LocalDate localDate = LocalDate.now();
		DayOfWeek dayOfWeek = localDate.getDayOfWeek();
		String WeekName = dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.KOREAN);
		LocalDate lastDayOfMonth = localDate.with(TemporalAdjusters.lastDayOfMonth());
		
		c.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
		
		c.set(Calendar.DAY_OF_WEEK, Calendar.SATURDAY);
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		ArrayList schedules = (ArrayList) pelsFormService.getList("GetSchedule", paramMap);
		
		for(int i=0; i<schedules.size(); i++) {
			Map<String, String> schedule = (Map<String, String>)schedules.get(i);
		
			String FRM_UNQ_KY_VAL = schedule.get("FRM_UNQ_KY_VAL");
			String ATCT_NM = schedule.get("ATCT_NM");
			String RRD_CFY = schedule.get("RRD_CFY");
			
			System.out.println("===================================================");
			System.out.println("FRM_UNQ_KY_VAL = " + FRM_UNQ_KY_VAL);
			System.out.println("ATCT_NM = " + ATCT_NM);
			System.out.println("RRD_CFY = " + RRD_CFY);
			/*
			if("주".equals(RRD_CFY) && "월".equals(WeekName)) {
				paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				c.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
				paramMap.put("CHCK_STRT_DT", sdf.format(c.getTime()));
				c.set(Calendar.DAY_OF_WEEK, Calendar.SATURDAY);
				paramMap.put("CHCK_END_DT", sdf.format(c.getTime()));
				paramMap.put("TITL_NM", "[" + localDate.getYear() + "년 " + getCurrentWeekOfMonth(localDate) + "] " + ATCT_NM);
				paramMap.put("CHKPR_ID", "");
				paramMap.put("CHKPR_FNM", "");
				paramMap.put("CNMR_ID", "");
				paramMap.put("CNMR_FNM", "");
				paramMap.put("ATWT_ID", "");
				paramMap.put("ATWT_FNM", "");
				paramMap.put("WRKOR_NO", "");
				paramMap.put("ATWT_PPL_CNT", "");
				paramMap.put("ATWT_RQST_YN", "");
				paramMap.put("PRSTS_CFY", "A");
				paramMap.put("REGPR_ID", "M1EU0004");
				paramMap.put("REGPR_NM", "SYSTEM");
				
				int TCNT = pelsFormService.getCount("ExamSchedulerCount", paramMap); // 총 조회수
				if(TCNT == 0) {
					pelsFormService.insert("InsertExam", paramMap);
				}
			}
			
			if("월".equals(RRD_CFY) && "30".equals(localDate.getDayOfMonth()+"")) {
				String CHCK_STRT_DT = localDate.withDayOfMonth(1) + "";
				String CHCK_END_DT = localDate.withDayOfMonth(localDate.lengthOfMonth()) + "";
				
				paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT.replaceAll("-", ""));
				paramMap.put("CHCK_END_DT", CHCK_END_DT.replaceAll("-", ""));
				paramMap.put("TITL_NM", "[" + localDate.getYear() + "년 " + localDate.getMonthValue() + "월] " + ATCT_NM);
				paramMap.put("CHKPR_ID", "");
				paramMap.put("CHKPR_FNM", "");
				paramMap.put("CNMR_ID", "");
				paramMap.put("CNMR_FNM", "");
				paramMap.put("ATWT_ID", "");
				paramMap.put("ATWT_FNM", "");
				paramMap.put("WRKOR_NO", "");
				paramMap.put("ATWT_PPL_CNT", "");
				paramMap.put("ATWT_RQST_YN", "");
				paramMap.put("PRSTS_CFY", "A");
				paramMap.put("REGPR_ID", "M1EU0004");
				paramMap.put("REGPR_NM", "SYSTEM");
				
				int TCNT = pelsFormService.getCount("ExamSchedulerCount", paramMap); // 총 조회수
				if(TCNT == 0) {
					pelsFormService.insert("InsertExam", paramMap);
				}
			}
			*/
			
			
			if("월2".equals(RRD_CFY) && ("1".equals(localDate.getDayOfMonth()+"") || "16".equals(localDate.getDayOfMonth()+""))) {
				System.out.println("------------------------------------------------");
				
				String CHCK_STRT_DT = localDate.withDayOfMonth(1) + "";
				String CHCK_END_DT = localDate.withDayOfMonth(localDate.lengthOfMonth()) + "";
				String TITL_NM = "";
				
				if("1".equals(localDate.getDayOfMonth()+"")) {
					CHCK_STRT_DT = localDate.withDayOfMonth(1) + "";
					CHCK_END_DT = localDate.withDayOfMonth(15) + "";
					TITL_NM = localDate.getYear() + "년 " + localDate.getMonthValue() + "월초";
				}
				else if("16".equals(localDate.getDayOfMonth()+"")) {
					CHCK_STRT_DT = localDate.withDayOfMonth(16) + "";
					CHCK_END_DT = localDate.withDayOfMonth(localDate.lengthOfMonth()) + "";
					TITL_NM = localDate.getYear() + "년 " + localDate.getMonthValue() + "월말";
				}
				paramMap.put("FRM_UNQ_KY_VAL", FRM_UNQ_KY_VAL);
				paramMap.put("CHCK_STRT_DT", CHCK_STRT_DT.replaceAll("-", ""));
				paramMap.put("CHCK_END_DT", CHCK_END_DT.replaceAll("-", ""));
				paramMap.put("TITL_NM", ATCT_NM + " " + TITL_NM);
				paramMap.put("CHKPR_ID", "");
				paramMap.put("CHKPR_FNM", "시스템");
				paramMap.put("CNMR_ID", "");
				paramMap.put("CNMR_FNM", "");
				paramMap.put("ATWT_ID", "");
				paramMap.put("ATWT_FNM", "");
				paramMap.put("WRKOR_NO", "");
				paramMap.put("ATWT_PPL_CNT", "");
				paramMap.put("ATWT_RQST_YN", "");
				paramMap.put("PRSTS_CFY", "A");
				paramMap.put("REGPR_ID", "M1EU0004");
				paramMap.put("REGPR_NM", "SYSTEM");
				int TCNT = pelsFormService.getCount("ExamSchedulerCount", paramMap);
				if(TCNT == 0) {
					String TST_UNQ_KY_VAL = pelsFormService.getLastUnqKey("ExamLastUnqNo");
					paramMap.put("TST_UNQ_KY_VAL", TST_UNQ_KY_VAL);
					
					pelsFormService.insert("InsertExam", paramMap);
				}
			}
			
		}

		Map resultMap = new HashMap<String, Object>();
		
		resultMap.put("result", "success");

		return resultMap;
	}
	
	public static String getCurrentWeekOfMonth(LocalDate localDate) {
		WeekFields weekFields = WeekFields.of(DayOfWeek.MONDAY, 4);
		
		int weekOfMonth = localDate.get(weekFields.weekOfMonth());
		
		if(weekOfMonth == 0) {
			LocalDate lastDayOfLastMonth = localDate.with(TemporalAdjusters.firstDayOfMonth()).minusDays(1);
			return getCurrentWeekOfMonth(lastDayOfLastMonth);
		}
		
		LocalDate lastDayOfMonth = localDate.with(TemporalAdjusters.lastDayOfMonth());
		if(weekOfMonth == lastDayOfMonth.get(weekFields.weekOfMonth()) && lastDayOfMonth.getDayOfWeek().compareTo(DayOfWeek.THURSDAY) < 0) {
			LocalDate firstDayOfNextMonth = lastDayOfMonth.plusDays(1);
			return getCurrentWeekOfMonth(firstDayOfNextMonth);
		}
		
		return localDate.getMonthValue() + "월 " + weekOfMonth + "주차"; 
	}
	
}
