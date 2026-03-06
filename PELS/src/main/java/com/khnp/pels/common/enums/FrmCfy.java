package com.khnp.pels.common.enums;

/**
 * 서식구분
 * 작업전회의 서식정보 - JOB
 * 일반회의(서식) - OCR
 * 일반회의(필기) - PDF
 * @author dev004
 *
 */
public enum FrmCfy {
	JOB("JOB", "작업전", "작업전회의"), OZR("OZR", "일반", "점검지A(필기)"), PDF("PDF", "필기", "PDF 등록");
	
	private String code;
	private String title;
	private String subTitle;
	
	FrmCfy(String code, String title, String subTitle) {
		this.code = code;
		this.title = title;
		this.subTitle = subTitle;
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
	
	public static FrmCfy fromString(String text) {
		for(FrmCfy frmCfy : FrmCfy.values()) {
			if(frmCfy.getCode().equalsIgnoreCase(text)) {
				return frmCfy;
			}
		}
		return FrmCfy.JOB;
	}
}
