package com.khnp.pels.common.enums;

/**
 * 파일관련 수정시 처리용
 * NO_CHANGED : 변화 없음
 * DATA_UPDATE: 첨부파일 데이터만 변경(GE_PL_FILE_S)
 * FILE_UPDATE: 첨부파일 변경(데이터+서버에 존재하는 파일)
 * FILE_NEW   : 첨부파일 신규(수정화면에서 신규로 등록)
 * @author wuser019
 *
 */
public enum FileUpdate {
	NO_CHANGED, DATA_UPDATE, FILE_UPDATE, FILE_NEW;
	
	public String getMode() {
		return this.name();
	}
	
	public static FileUpdate fromString(String text) {
		for(FileUpdate fileUpdate : FileUpdate.values()) {
			if(fileUpdate.getMode().equalsIgnoreCase(text)) {
				return fileUpdate;
			}
		}
		return FileUpdate.NO_CHANGED;
	}
}
