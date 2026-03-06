package com.khnp.pels.common.enums;

/**
 * 시험(점검)이력정보 진행상태구분
 * 준비 - R
 * 수행 - F
 * 정지 - S
 * 완료 - C
 * @author dev004
 *
 */
public enum PrstsCfy {
	READY("R", "준비"), 
	FULFILL("F", "수행"),
	STOP("S", "정지"), 
	COMPLETE("C", "완료");
	
	private String code;
	private String title;
	
	PrstsCfy(String code, String title) {
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
