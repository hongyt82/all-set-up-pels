package com.khnp.pels.form.service;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.commons.fileupload.FileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import com.khnp.pels.common.dto.CommonFileDTO;
import com.khnp.pels.common.enums.AtflGrupNm;
import com.khnp.pels.common.enums.FileUpdate;
import com.khnp.pels.common.enums.FrmCfy;
import com.khnp.pels.common.service.PELSFileLogicService;

@Service("pelsFormLogicService")
public class PELSFormLogicServiceImpl implements PELSFormLogicService {
	
	@Autowired
	private PELSFormService pelsFormService;
	
	@Autowired
	private PELSFileLogicService pelsFileLogicService;
	
	private static final Logger log = LoggerFactory.getLogger(PELSFormLogicServiceImpl.class);
	
	/**
	 * 절차서(서식)관리 > ... > 등록, 수정 처리
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public String formSave(HashMap<String, Object> paramMap, MultipartHttpServletRequest mReq) throws Exception {
		String UNQ_NO = "";
		String resultMsg = "";
		
		String callMethod = paramMap.get("callMethod") != null ? paramMap.get("callMethod").toString() : "";
		boolean isInsert = "INSERT".equals(callMethod);
		boolean isUpdate = "UPDATE".equals(callMethod);
		AtflGrupNm atflGrupNm = (AtflGrupNm) paramMap.get("ATFL_GRUP_NM");
		Map<String, String> queryIdMap = this.getQueryIdMap(atflGrupNm);
		
		// 테이블 UNQ_NO값 구하기, 첨부파일(GE_MP_FILE_S) 테이블 저장용
		// 등록시 테이블에서 서식고유키값 조회, 수정시 기존 고유키값 사용
		if (isInsert) {
			UNQ_NO = pelsFormService.getLastUnqKey(queryIdMap.get("getLastUnqKey")); // 고유번호, 파일 저장시 사용하기 위해서...
			
			switch(atflGrupNm) {
				case FRM_M:
				case ETC_FRM_M:
					paramMap.put("FRM_UNQ_KY_VAL", UNQ_NO);
					break;
				case CHECK_S:
					paramMap.put("TST_UNQ_KY_VAL", UNQ_NO);
					break;					
				case FRM_MNT_S:
				case JOB_S:
				case ETC_FRM_S:
					paramMap.put("UNQ_KY_VAL", UNQ_NO);
					break;
				case BOARD_S:
					paramMap.put("BLBR_UNQ_KY_VAL", UNQ_NO);
					break;
			}
		}
		else if (isUpdate) {
			switch(atflGrupNm) {
				case FRM_M:
				case ETC_FRM_M:
					UNQ_NO = paramMap.get("FRM_UNQ_KY_VAL") != null ? paramMap.get("FRM_UNQ_KY_VAL").toString() : "";
					break;
				case CHECK_S:
					UNQ_NO = paramMap.get("TST_UNQ_KY_VAL") != null ? paramMap.get("TST_UNQ_KY_VAL").toString() : "";
					break;
				case FRM_MNT_S:
				case JOB_S:
				case ETC_JOB_S:
				case ETC_FRM_S:
					UNQ_NO = paramMap.get("UNQ_KY_VAL") != null ? paramMap.get("UNQ_KY_VAL").toString() : "";
					break;
				case BOARD_S:
					UNQ_NO = paramMap.get("BLBR_UNQ_KY_VAL") != null ? paramMap.get("BLBR_UNQ_KY_VAL").toString() : "";
					break;
			}
		}
		
		
		// 첨부파일 저장처리
		// 1. 파일 서버 저장
		// 2. 첨부파일(GE_MP_FILE_S) 테이블 저장 처리
		Map<String, CommonFileDTO> commonFileMap = new HashMap<String, CommonFileDTO>();
		Iterator<String> iterator = mReq.getFileNames();
		
		while (iterator.hasNext()) {
			String uploadFileName = iterator.next();
			CommonsMultipartFile mFile = (CommonsMultipartFile) mReq.getFile(uploadFileName);
			
            if(mFile != null && !mFile.isEmpty() && mFile.getSize() > 0) {
            	FileItem fileItem = mFile.getFileItem();
                String fieldName = fileItem.getFieldName();
                
                log.info("file upload logic fieldName: {}", fieldName);
                 
                Map<String, String> atflMap = this.getAtflMap(paramMap, fieldName, atflGrupNm);

                CommonFileDTO fileDto = new CommonFileDTO();
                fileDto.setmFile(mFile); 							// 첨부파일
                fileDto.setAtflGrupNm(atflGrupNm); 					// 첨부파일구분
                fileDto.setUnqNo(UNQ_NO); 							// 고유번호, 첨부파일구분 데이터에 저장할 때 사용한 고유번호
                fileDto.setAtflId(atflMap.get("ATFL_ID")); 			// 첨부파일ID
                fileDto.setAtflTitlNm(atflMap.get("ATFL_TITL_NM")); // 첨부파일제목명
                
        		switch(atflGrupNm) {
	        		case BOARD_S:
		        		String orgFileName = mFile.getOriginalFilename();
		                int index = orgFileName.lastIndexOf(".");
		                String fileExt = orgFileName.substring(index + 1);
		                
	                    fileDto.setAtflFextNm(fileExt);
	        			break;
        			default:
                        fileDto.setAtflFextNm(atflMap.get("ATFL_FEXT_NM")); // 첨부파일확장자명
        				break;
        		}
                fileDto.setAtflGrupNm(atflGrupNm);
                 
                if (isInsert) {
                	fileDto.setCallMethod("INSERT");
          		} else if (isUpdate) {
          			fileDto.setCallMethod("UPDATE");
          		}
                commonFileMap.put(atflMap.get("ATFL_ID"), fileDto);
            }
		}
		
		// 수정모드이고, 정주기서식정보(GE_MP_FRM_M) 테이블 업데이트하는 경우 업데이트 모드 추가
		if(isUpdate && AtflGrupNm.FRM_M.getCode().equals(atflGrupNm.getCode())) {
			// fileUpdate 모드에 따른 처리...
			// 1) NO_CHANGED : 변화 없음
			// 2) DATA_UPDATE: 첨부파일 데이터만 변경(GE_MP_FILE_S)
			// 3) FILE_UPDATE: 첨부파일 변경(데이터+서버에 존재하는 파일)
			// 4) FILE_NEW   : 첨부파일 수정화면에서 신규 등록(데이터+서버에 존재하는 파일)
			
			// 서식첨부1~5까지 업데이트 체크
			for(int i = 1; i <= 3; i++) {
				String ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM" + i) != null ? paramMap.get("ATFL_TITL_NM" + i).toString() : "";
				this.updateFileMapCheck(commonFileMap, UNQ_NO, ATFL_TITL_NM, "" + i);
			}
		}
		else {
			for(int i = 1; i <= 1; i++) {
				String ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM" + i) != null ? paramMap.get("ATFL_TITL_NM" + i).toString() : "";
				this.updateFileMapCheck(commonFileMap, UNQ_NO, ATFL_TITL_NM, "" + i);
			}			
		}
		
		commonFileMap.keySet().forEach(key -> {
			try {
				log.debug("commonFileSaveLogic start > ATFL_ID: {}", key);
				pelsFileLogicService.commonFileSaveLogic(commonFileMap.get(key));
				log.debug("commonFileSaveLogic end > ATFL_ID: {}", key);
			} catch (Exception e) {
				log.error("commonFileSaveLogic error > ATFL_ID: {}, error: {}", key, e.getMessage(), e);
				throw new RuntimeException(e);
			}
		});
		
		// 각 테이블 저장
		if (isInsert) {
			pelsFormService.insert(queryIdMap.get("insert"), paramMap);
			resultMsg = "등록이 완료되었습니다.";
		}
		else if (isUpdate) {
			pelsFormService.update(queryIdMap.get("update"), paramMap);
			resultMsg = "수정이 완료되었습니다.";
		}
		
		return resultMsg;
	}
	
	/**
	 * 정주기서식정보 수정시 업데이트 모드 체크
	 * @param commonFileMap
	 * @param ATFL_TITL_NM
	 * @param ATFL_ID
	 */
	private void updateFileMapCheck(Map<String, CommonFileDTO> commonFileMap, String UNQ_NO, String ATFL_TITL_NM, String ATFL_ID) {
		log.debug("updateFileMapCheck start > UNQ_NO: {}, ATFL_TITL_NM: {}, ATFL_ID: {}", UNQ_NO, ATFL_TITL_NM, ATFL_ID);
		
		if(commonFileMap.containsKey(ATFL_ID)) {
			// 업데이트하는 파일이 있는 경우
			CommonFileDTO fileDto = commonFileMap.get(ATFL_ID);
			
			// 기존 데이터 저장 여부(있으면 FILE_UPDATE, 없으면 FILE_NEW)
			if(pelsFileLogicService.hasFileData(fileDto.getAtflGrupNm().getCode(), UNQ_NO, ATFL_ID)) {
				fileDto.setFileUpdate(FileUpdate.FILE_UPDATE);
				log.debug("updateFileMapCheck is file update > UNQ_NO: {}, ATFL_TITL_NM: {}, ATFL_ID: {}", UNQ_NO, ATFL_TITL_NM, ATFL_ID);
			} else {
				fileDto.setFileUpdate(FileUpdate.FILE_NEW);
				log.debug("updateFileMapCheck is new file update > UNQ_NO: {}, ATFL_TITL_NM: {}, ATFL_ID: {}", UNQ_NO, ATFL_TITL_NM, ATFL_ID);
			}
		} else {
			// 업데이트하는 파일이 없는 경우
			
			// 서식 제목 있는 경우
			if(!"".equals(ATFL_TITL_NM)) {
				
				// 기존 데이터 저장 여부(있으면, 없으면 처리 무)
				if(pelsFileLogicService.hasFileData(AtflGrupNm.FRM_M.getCode(), UNQ_NO, ATFL_ID)) {
					
					String atflTitlNm = pelsFileLogicService.getAtflTitlNm(AtflGrupNm.FRM_M.getCode(), UNQ_NO, ATFL_ID);
					
					// 기존 서식데이터와 동일한지 체크
					if(atflTitlNm.equals(ATFL_TITL_NM)) {
						// 처리 없음...
						log.debug("updateFileMapCheck is no change > UNQ_NO: {}, ATFL_TITL_NM: {}, ATFL_ID: {}", UNQ_NO, ATFL_TITL_NM, ATFL_ID);
					} else {
						// 동일하지 않으면 수정
						CommonFileDTO fileDto = new CommonFileDTO();
						
						fileDto.setCallMethod("UPDATE");
						
						fileDto.setAtflGrupNm(AtflGrupNm.FRM_M); // 첨부파일구분
		                fileDto.setUnqNo(UNQ_NO); // 고유번호, 첨부파일구분 데이터에 저장할 때 사용한 고유번호
		                fileDto.setAtflId(ATFL_ID); // 첨부파일ID
		                
		                fileDto.setAtflTitlNm(ATFL_TITL_NM); // 첨부파일서식명
						
						fileDto.setFileUpdate(FileUpdate.DATA_UPDATE);
						
						commonFileMap.put(ATFL_ID, fileDto);
						log.debug("updateFileMapCheck is data update > UNQ_NO: {}, ATFL_TITL_NM: {}, ATFL_ID: {}", UNQ_NO, ATFL_TITL_NM, ATFL_ID);
					}
					
					
				} else {
					// 처리 없음...
					log.debug("updateFileMapCheck is wrong > UNQ_NO: {}, ATFL_TITL_NM: {}, ATFL_ID: {}", UNQ_NO, ATFL_TITL_NM, ATFL_ID);
				}
			} else {
				// 처리 없음...
				log.debug("updateFileMapCheck is none > UNQ_NO: {}, ATFL_TITL_NM: {}, ATFL_ID: {}", UNQ_NO, ATFL_TITL_NM, ATFL_ID);
			}
		}
		
		log.debug("updateFileMapCheck end > ATFL_TITL_NM: {}, ATFL_ID: {}", ATFL_TITL_NM, ATFL_ID);
	}
	
	
	/**
	 * 절차서(서식)관리 > ... > 삭제 처리
	 */
	@Override
	@Transactional
	public String formDelete(HashMap<String, Object> paramMap) throws Exception {
		// 1. GE_MP_FRM_M 테이블의 데이터 삭제
		// 2. 첨부파일(GE_MP_FILE_S) 테이블의 데이터 삭제
		// 3. 서버에 저장된 파일삭제
		AtflGrupNm atflGrupNm = (AtflGrupNm) paramMap.get("ATFL_GRUP_NM");
		Map<String, String> queryIdMap = this.getQueryIdMap(atflGrupNm);
		int resultCnt = pelsFormService.delete(queryIdMap.get("delete"), paramMap);	
		String resultMsg =  resultCnt + " 건의 삭제가 완료되었습니다.";
		
		/*
		String CHK_ITEMS = paramMap.get("CHK_ITEMS").toString();
		
		if(StringUtils.hasText(CHK_ITEMS)) {
			String[] chkItemsArr = CHK_ITEMS.split(",");
			
			for(String chkItem : chkItemsArr) {
				chkItem = chkItem.trim();
				
				
				CommonFileDTO fileDto = new CommonFileDTO();
				fileDto.setCallMethod("DELETE");
				fileDto.setAtflGrupNm(atflGrupNm);
				fileDto.setUnqNo(chkItem);
				
				pelsFileLogicService.commonFileSaveLogic(fileDto);
			}
		}
		*/
		
		return resultMsg;
	}
	
	/**
	 * 절차서(서식)관리 > ... > 수정 > 파일삭제
	 */
	@Override
	@Transactional
	public String formFileDelete(HashMap<String, Object> paramMap) throws Exception {
		// 1. 첨부파일(GE_MP_FILE_S) 테이블의 데이터 삭제
		// 2. 서버에 저장된 파일삭제
		try {
			AtflGrupNm atflGrupNm = (AtflGrupNm) paramMap.get("ATFL_GRUP_NM");
			String UNQ_NO = paramMap.get("UNQ_NO").toString();
			String ATFL_ID = paramMap.get("ATFL_ID").toString();
			
			pelsFileLogicService.deleteFileProcess(atflGrupNm.getCode(), UNQ_NO, ATFL_ID);
		} catch(Exception e) {
			log.error(e.getMessage(), e);
			
			throw e;
		}
		
		return "삭제가 완료되었습니다.";
	}
	
	/**
	 * 첨부ID, 파일제목명, 확장자 세팅
	 * @param paramMap 패러미터 매핑
	 * @param fieldName 필드명
	 * @param atflGrupNm 첨부파일구분
	 * @return
	 */
	private Map<String, String> getAtflMap(HashMap<String, Object> paramMap, String fieldName, AtflGrupNm atflGrupNm) {
		Map<String, String> atflMap = new HashMap<String, String>();
		String ATFL_ID = ""; // 첨부파일ID
        String ATFL_TITL_NM = ""; // 첨부파일제목명
		String ATFL_FEXT_NM = ""; // 첨부파일확장자
		
		switch(atflGrupNm) {
			// 서식정보(GE_MP_FRM_M)
			case FRM_M:
				if("ATFL_FILE1".equals(fieldName)) {					
		         	ATFL_ID = "1";
		         	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM1") != null ? paramMap.get("ATFL_TITL_NM1").toString() : "";
		         	ATFL_FEXT_NM = "pdf";
		         } else if("ATFL_FILE2".equals(fieldName)) {
		         	ATFL_ID = "2";
		         	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM2") != null ? paramMap.get("ATFL_TITL_NM2").toString() : "";
		         	ATFL_FEXT_NM = "json";
		         } else if("ATFL_FILE3".equals(fieldName)) {
		         	ATFL_ID = "3";
		         	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM3") != null ? paramMap.get("ATFL_TITL_NM3").toString() : "";
		         	ATFL_FEXT_NM = "json";
		         } else if("ATFL_FILE4".equals(fieldName)) {
		         	ATFL_ID = "4";
		         	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM4") != null ? paramMap.get("ATFL_TITL_NM4").toString() : "";
		         } else if("ATFL_FILE5".equals(fieldName)) {
		         	ATFL_ID = "5";
		         	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM5") != null ? paramMap.get("ATFL_TITL_NM5").toString() : "";
		         }
				//ATFL_FEXT_NM = "ozr";
				break;
			// 작업전회의 서식정보(GE_MP_JOBFRM_M)
			case ETC_FRM_M:
				FrmCfy frmCfy = (FrmCfy) paramMap.get("FRM_CFY");
				switch(frmCfy) {
					// 작업전회의
					case JOB:
						ATFL_ID = "1";
		             	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM1") != null ? paramMap.get("ATFL_TITL_NM1").toString() : "";
		             	ATFL_FEXT_NM = "ozr";
						break;
					// 일반양식(서식)
					case OZR:
						ATFL_ID = "1";
		             	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM1") != null ? paramMap.get("ATFL_TITL_NM1").toString() : "";
		             	ATFL_FEXT_NM = "ozr";
						break;
					// 일반양식(필기)
					case PDF:
						ATFL_ID = "1";
		             	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM1") != null ? paramMap.get("ATFL_TITL_NM1").toString() : "";
		             	ATFL_FEXT_NM = "pdf";
						break;
				}
				break;
			case CHECK_S:
	         	ATFL_ID = "1";
	         	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM1") != null ? paramMap.get("ATFL_TITL_NM1").toString() : "";
	         	ATFL_FEXT_NM = "pdf";
	         	break;
			case FRM_MNT_S:
			case JOB_S:
			case ETC_FRM_S:
			case ETC_JOB_S:
				ATFL_ID = "1";
             	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM1") != null ? paramMap.get("ATFL_TITL_NM1").toString() : "";
             	ATFL_FEXT_NM = "ozd";
				break;
			case BOARD_S:
				ATFL_ID = "1";
             	ATFL_TITL_NM = paramMap.get("ATFL_TITL_NM1") != null ? paramMap.get("ATFL_TITL_NM1").toString() : "";
             	ATFL_FEXT_NM = "";
				break;
		}
		
		atflMap.put("ATFL_ID", ATFL_ID);
		atflMap.put("ATFL_TITL_NM", ATFL_TITL_NM);
		atflMap.put("ATFL_FEXT_NM", ATFL_FEXT_NM);
		
		return atflMap;
	}
	
	/**
	 * 쿼리 아이디 세팅
	 * @param atflGrupNm 첨부파일구분
	 * @return
	 */
	private Map<String, String> getQueryIdMap(AtflGrupNm atflGrupNm) {
		Map<String, String> queryIdMap = new HashMap<String, String>();
		String getLastUnqKey = "";
		String insert = "";
		String update = "";
		String delete = "";
		
		switch(atflGrupNm) {
			// 서식정보(GE_MP_FRM_M)
			case FRM_M:
				getLastUnqKey = "FormLastUnqNo";
				insert = "InsertForm";
				update = "UpdateForm";
				delete = "DeleteForm";
				break;
			// 기타서식정보(GE_MP_ETCFRM_M)
			case ETC_FRM_M:
				getLastUnqKey = "EtcFormLastUnqNo";
				insert = "InsertEtcForm";
				update = "UpdateEtcForm";
				delete = "DeleteEtcForm";
				break;
			case CHECK_S:
				getLastUnqKey = "CheckLastUnqNo";
				insert = "InsertExam";
				update = "UpdateCheck";
				delete = "DeleteCheck";
				break;
			case FRM_MNT_S:
				getLastUnqKey = "FormMntLastUnqNo";
				insert = "InsertFormMnt";
				update = "UpdateFormMnt";
				delete = "DeleteFormMnt";
				break;
			case JOB_S:
				getLastUnqKey = "JobSLastUnqNo";
				insert = "InsertJobS";
				update = "UpdateJobS";
				delete = "DeleteJobS";
				break;
			case ETC_JOB_S:
				getLastUnqKey = "EtcJobLastUnqNo";
				insert = "InsertEtcJob";
				update = "UpdateEtcJob2";
				delete = "DeleteEtcJob";
				break;
			case ETC_FRM_S:
				getLastUnqKey = "EtcHistoryFormLastUnqNo";
				insert = "InsertEtcHistoryForm";
				update = "UpdateEtcHistoryForm";
				delete = "DeleteEtcHistoryForm";
				break;
			case BOARD_S:
				getLastUnqKey = "BoardLastUnqNo";
				insert = "InsertBoard";
				update = "UpdateBoard";
				delete = "DeleteBoard";
				break;
		}
		
		queryIdMap.put("getLastUnqKey", getLastUnqKey);
		queryIdMap.put("insert", insert);
		queryIdMap.put("update", update);
		queryIdMap.put("delete", delete);
		
		
		return queryIdMap;
	}
}
