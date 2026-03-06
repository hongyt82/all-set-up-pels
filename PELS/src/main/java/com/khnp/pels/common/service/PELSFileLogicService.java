package com.khnp.pels.common.service;

import com.khnp.pels.common.dto.CommonFileDTO;

public interface PELSFileLogicService {
	public int commonFileSaveLogic(CommonFileDTO commonFileDto) throws Exception;
	public boolean hasFileData(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID);
	public String getAtflTitlNm(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID);
	public String getFileSrc(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID);
	public int deleteFileProcess(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID);
	public int deleteFileProcess(String ATFL_GRUP_NM, String UNQ_NO);
}
