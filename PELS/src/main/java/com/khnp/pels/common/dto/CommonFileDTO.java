package com.khnp.pels.common.dto;

import org.springframework.web.multipart.MultipartFile;

import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.FileUpdate;

/**
 * 첨부파일용 공통 파일 DTO
 * @author wuser019
 *
 */
public class CommonFileDTO {
	private MultipartFile mFile; // 첨부파일
	
	private String atflUnqNo; // 첨부파일고유번호(안씀)
	private AtflGrupNm atflGrupNm; // 첨부파일그룹명
	private String unqNo; // 고유번호
	private String atflId; // 첨부파일ID
	private String atflPthNm; // 첨부파일경로명
	private String atflTitlNm; // 첨부파일제목명
	private String atflOrsrcNm; // 첨부파일원본명
	private String atflPhclNm; // 첨부파일물리명
	private String atflFextNm; // 첨부파일확장자명
	private String atflSz; // 첨부파일크기
	
	private String callMethod; // 호출 메서드(INSERT, UPDATE, DELETE)
	
	public CommonFileDTO() {
		
	}
	
	private FileUpdate fileUpdate; // 파일업데이트모드
	
	public MultipartFile getmFile() {
		return mFile;
	}
	public void setmFile(MultipartFile mFile) {
		this.mFile = mFile;
	}
	public String getAtflUnqNo() {
		return atflUnqNo;
	}
	public void setAtflUnqNo(String atflUnqNo) {
		this.atflUnqNo = atflUnqNo;
	}
	public AtflGrupNm getAtflGrupNm() {
		return atflGrupNm;
	}
	public void setAtflGrupNm(AtflGrupNm atflGrupNm) {
		this.atflGrupNm = atflGrupNm;
	}
	public String getUnqNo() {
		return unqNo;
	}
	public void setUnqNo(String unqNo) {
		this.unqNo = unqNo;
	}
	public String getAtflId() {
		return atflId;
	}
	public void setAtflId(String atflId) {
		this.atflId = atflId;
	}
	public String getAtflPthNm() {
		return atflPthNm;
	}
	public void setAtflPthNm(String atflPthNm) {
		this.atflPthNm = atflPthNm;
	}
	public String getAtflTitlNm() {
		return atflTitlNm;
	}
	public void setAtflTitlNm(String atflTitlNm) {
		this.atflTitlNm = atflTitlNm;
	}
	public String getAtflOrsrcNm() {
		return atflOrsrcNm;
	}
	public void setAtflOrsrcNm(String atflOrsrcNm) {
		this.atflOrsrcNm = atflOrsrcNm;
	}
	public String getAtflPhclNm() {
		return atflPhclNm;
	}
	public void setAtflPhclNm(String atflPhclNm) {
		this.atflPhclNm = atflPhclNm;
	}
	public String getAtflFextNm() {
		return atflFextNm;
	}
	public void setAtflFextNm(String atflFextNm) {
		this.atflFextNm = atflFextNm;
	}
	public String getAtflSz() {
		return atflSz;
	}
	public void setAtflSz(String atflSz) {
		this.atflSz = atflSz;
	}
	public String getCallMethod() {
		return callMethod;
	}
	public void setCallMethod(String callMethod) {
		this.callMethod = callMethod;
	}
	public FileUpdate getFileUpdate() {
		return fileUpdate;
	}
	public void setFileUpdate(FileUpdate fileUpdate) {
		this.fileUpdate = fileUpdate;
	}
	
	
	public boolean isInsert() {
		return "INSERT".equals(this.getCallMethod());
	}
	public boolean isUpdate() {
		return "UPDATE".equals(this.getCallMethod());
	}
	
}
