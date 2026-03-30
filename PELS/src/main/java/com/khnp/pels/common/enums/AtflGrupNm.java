package com.khnp.pels.common.enums;

/**
 * 첨부파일그룹명
 * 
 * 시험(점검)이력정보 - GE_PL_EXAM_S
 * 일반양식필기이력정보 - GE_PL_GENPDF_S
 * 
 * @author dev004
 *
 */
public enum AtflGrupNm {
	EXAM_S("GE_PL_EXAM_S", "시험(점검)이력정보"), 
	GENPDF_S("GE_PL_GENPDF_S", "일반양식이력정보"), 
	BOARD_S("GE_PL_BOARD_S", "HELP DESK"); 
	
	private String code;
	private String title;
	
	AtflGrupNm(String code, String title) {
		this.code = code;
		this.title = title;
	}
	
	public String getCode() {
		return code;
	}
	
	public String getTitle() {
		return title;
	}
}
