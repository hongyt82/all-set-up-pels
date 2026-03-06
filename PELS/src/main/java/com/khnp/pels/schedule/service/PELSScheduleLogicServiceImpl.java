package com.khnp.pels.schedule.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("pelsScheduleLogicService")
public class PELSScheduleLogicServiceImpl implements PELSScheduleLogicService {
	
	private static final Logger log = LoggerFactory.getLogger(PELSScheduleLogicServiceImpl.class);
	
	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); 
	
	@Autowired
	private PELSScheduleService pelsScheduleService;
	
	/**
	 * 월별 시험계획표 가져오기
	 * 데이터 확인 후 없으면 생성
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public List<Map<String, String>> getMonth(String SCHDL_PLN_DY) {
		// 임시체크...
		// 날짜 검사
		if(!this.checkMonth(SCHDL_PLN_DY)) {
			// 날짜 검사에 실패하면 생성...
			int createCnt = this.createMonth(SCHDL_PLN_DY);
			log.debug("getMonth createData... > SCHDL_PLN_DY: {}, createCnt: {}", SCHDL_PLN_DY, createCnt);
		}
		
		// DB에 저장된 날짜 체크...
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		LocalDate nowDate = LocalDate.parse(SCHDL_PLN_DY, formatter);
		
		LocalDate startDate = nowDate.withDayOfMonth(1);
		LocalDate endDate = nowDate.withDayOfMonth(nowDate.lengthOfMonth());
		
		paramMap.put("SCHDL_PLN_STRT_DY", startDate.format(formatter).replaceAll("-", ""));
		paramMap.put("SCHDL_PLN_END_DY", endDate.format(formatter).replaceAll("-", ""));
		
		return pelsScheduleService.getList("MonthList", paramMap);
	}
	
	private boolean checkMonth(String SCHDL_PLN_DY) {
		// 그 달의 날짜수
		int daysInMonth = LocalDate.parse(SCHDL_PLN_DY, formatter).lengthOfMonth();
		
		// DB에 저장된 날짜 체크...
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.withDayOfMonth(1);
		LocalDate endDate = nowDate.withDayOfMonth(nowDate.lengthOfMonth());
		
		paramMap.put("SCHDL_PLN_STRT_DY", SCHDL_PLN_DY.replaceAll("-", ""));
		
		int daysInSavedData = pelsScheduleService.getCount("MonthCount", paramMap);
		
		boolean isTrue = daysInSavedData > 0;
		
		if(!isTrue) log.debug("checkMonth is fail... > daysInMonth: {}, daysInSavedData: {}");
		
		return isTrue;
	}
	
	/*
	private boolean checkMonth(String SCHDL_PLN_DY) {
		// 그 달의 날짜수
		int daysInMonth = LocalDate.parse(SCHDL_PLN_DY, formatter).lengthOfMonth();
		
		// DB에 저장된 날짜 체크...
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		LocalDate nowDate = LocalDate.now();
		LocalDate startDate = nowDate.withDayOfMonth(1);
		LocalDate endDate = nowDate.withDayOfMonth(nowDate.lengthOfMonth());
		
		paramMap.put("SCHDL_PLN_STRT_DY", startDate.format(formatter).replaceAll("-", ""));
		paramMap.put("SCHDL_PLN_END_DY", endDate.format(formatter).replaceAll("-", ""));
		
		int daysInSavedData = pelsScheduleService.getCount("MonthCount", paramMap);
		
		boolean isTrue = daysInMonth == daysInSavedData;
		
		if(!isTrue) log.debug("checkMonth is fail... > daysInMonth: {}, daysInSavedData: {}");
		
		return isTrue;
	}
	*/

	private int createMonth(String SCHDL_PLN_DY) {
		// TODO Auto-generated method stub
		LocalDate nowDate = LocalDate.parse(SCHDL_PLN_DY, formatter);
		
		LocalDate startDate = nowDate.withDayOfMonth(1);
		LocalDate endDate = nowDate.withDayOfMonth(nowDate.lengthOfMonth());
		int createCnt = 0;
		
		for(LocalDate currentDate = startDate; !currentDate.isAfter(endDate); currentDate = currentDate.plusDays(1)) {
			HashMap<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("SCHDL_PLN_DY", currentDate.format(formatter).replaceAll("-", ""));
			
			List<Map> findList = pelsScheduleService.getList("MonthDetailBySchdlPlnDy", paramMap);
			
			if(findList != null && findList.size() > 0) {
				// 존재할 경우 건너띔
				continue;
			} else {
				// 없을 경우 신규 생성
				paramMap.put("TH1_ITM_NM", "");
				paramMap.put("TH2_ITM_NM", "");
				paramMap.put("TH3_ITM_NM", "");
				paramMap.put("TH4_ITM_NM", "");
				paramMap.put("REGPR_ID", ""); // 확인 필요... 임시로 비워둠
				paramMap.put("REGPR_NM", ""); // 확인 필요... 임시로 비워둠
				pelsScheduleService.insert("InsertMonth", paramMap);
				createCnt++;
			}
		}
		return createCnt;
	}
}
