package com.khnp.pels.common.enums;

/**
 * 정주기서식정보 절차서 구분
 * 정주기시험 - P
 * 점검관리  - M
 * @author dev004
 *
 */
public enum PrcdocCfy {
	MAIN("P", "정주기시험", "정주기시험", "Form_Search.do"), 
	ATCT("M", "점검관리", "점검관리(붙임)", "Form_Atct_Search.do");
	
	private String code;
	private String title;
	private String subTitle;
	private String subTitleUrl;
	
	PrcdocCfy(String code, String title, String subTitle, String subTitleUrl) {
		this.code = code;
		this.title = title;
		this.subTitle = subTitle;
		this.subTitleUrl = subTitleUrl;
	}
	
	public String getCode() {
		return code;
	}
	
	public String getTitle() {
		return title;
	}
	
	public String getSubTitle() {
		return subTitle;
	}
	
	public String getSubTitleUrl() {
		return subTitleUrl;
	}
	
	public static PrcdocCfy fromString(String text) {
		for(PrcdocCfy procdocCfy : PrcdocCfy.values()) {
			if(procdocCfy.getCode().equalsIgnoreCase(text)) {
				return procdocCfy;
			}
		}
		return PrcdocCfy.MAIN;
	}
}
