package com.khnp.pels.common.enums;

/**
 * 첨부파일그룹명
 * 정주기서식정보 - GE_PL_FRM_M
 * 작업전회의 서식정보 - GE_PL_JOBFRM_M
 * 일반양식서식정보 - GE_PL_GENFRM_M
 * 일반양식필기정보 - GE_PL_GENPDF_M
 * 시험(점검)이력정보 - GE_PL_CHECK_S
 * 작업전회의이력정보 - GE_PL_JOB_S
 * 일반양식서식이력정보 - GE_PL_GENFRM_S
 * 일반양식필기이력정보 - GE_PL_GENPDF_S
 * 
 * @author dev004
 *
 */
public enum AtflGrupNm {
	FRM_M("GE_PL_FRM_M", "정주기서식정보"), 
	ETC_FRM_M("GE_PL_ETCFRM_M", "기타 서식정보"),
	CHECK_S("GE_PL_CHECK_S", "시험(점검)이력정보"), 
	FRM_MNT_S("GE_PL_FRMMNT_S", "점검관리이력정보"),
	JOB_S("GE_PL_JOB_S", "작업전회의이력정보"), 
	ETC_FRM_S("GE_PL_ETCFRM_S", "일반양식이력정보"), 
	ETC_JOB_S("GE_PL_JOB_S", "작업전회의이력정보"),
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
