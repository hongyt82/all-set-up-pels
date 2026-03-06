package com.khnp.pels.common.service;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.ServletException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.khnp.pels.common.dto.CommonFileDTO;
import com.khnp.pels.common.enums.FileUpdate;

import SCSL.SLDsFile;
import common.util.*;

@Service("pelsFileLogicService")
public class PELSFileLogicServiceImpl implements PELSFileLogicService {
	
	@Autowired
	private PELSFileService pelsFileService;
	
	@Resource(name = "utilProperties")
	private Properties utilProperties;

	private static final Logger log = LoggerFactory.getLogger(PELSFileLogicServiceImpl.class);
	
	private final SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmssSSS", java.util.Locale.KOREA);
	private final SimpleDateFormat format2 = new SimpleDateFormat("yyyyMMddHHmmSSSss", java.util.Locale.KOREA);
	private final SimpleDateFormat format_sss = new SimpleDateFormat("SSS", java.util.Locale.KOREA);

	/**
	 * 공통 파일 저장 처리
	 * @param callMethod Insert/Update/Delete
	 * @param paramMap 첨부파일정보
	 * @return
	 * @throws Exception
	 */
	@Override
	public int commonFileSaveLogic(CommonFileDTO commonFileDto) throws Exception {
		System.out.println("=== 공통 파일 저장 처리 ===");
		String OZ_HOME = utilProperties.getProperty("OZ_HOME");
		
		MultipartFile mFile = commonFileDto.getmFile();
		String callMethod = commonFileDto.getCallMethod();
		
		String ATFL_GRUP_NM = commonFileDto.getAtflGrupNm().getCode(); 	// 첨부파일구분(테이블명)
		String UNQ_NO = commonFileDto.getUnqNo(); 						// 고유번호
		String ATFL_ID = commonFileDto.getAtflId(); 					// 첨부파일ID
		
		String ATFL_TITL_NM = commonFileDto.getAtflTitlNm(); // 첨부파일서식제목
		String ATFL_FEXT_NM = commonFileDto.getAtflFextNm(); // 첨부파일확장자명
		
		String ATFL_PTH_NM = ""; 			// 첨부파일경로명
		String ATFL_ORSRC_NM = ""; 			// 첨부파일원래명
		String ATFL_PHCL_NM = ""; 			// 첨부파일명
		String ATFL_SZ = mFile != null ? String.valueOf(mFile.getSize()) : "0"; // 첨부파일크기
		
		if("INSERT".equals(callMethod)) {

			// 파일서버 저장
			Map uploadFileResultMap = uploadFile(ATFL_GRUP_NM, mFile, ATFL_FEXT_NM);
			
			// 파일서버 저장 성공시...
			if(uploadFileResultMap != null) {
				ATFL_PTH_NM = (String) uploadFileResultMap.get("ATFL_PTH_NM"); 		// 첨부파일경로명
				ATFL_ORSRC_NM = (String) uploadFileResultMap.get("ATFL_ORSRC_NM"); 	// 첨부파일원래명
				ATFL_PHCL_NM = (String) uploadFileResultMap.get("ATFL_PHCL_NM"); 	// 첨부파일명

				if("ozr".contentEquals(ATFL_FEXT_NM)) {
					//
					// OZD로 만든다.
					//
					HashMap paramsMap = new HashMap();
					HttpConnectionUtil HUtil = new HttpConnectionUtil();
				    paramsMap.put("ozrName", ATFL_GRUP_NM + "/" + ATFL_PHCL_NM + ".ozr");
				    paramsMap.put("ozdName", ATFL_GRUP_NM + "/" + ATFL_PHCL_NM + ".ozd");
				    String result2 = HUtil.postRequest(OZ_HOME + "/pels/ozr_ozd.jsp", paramsMap);	
				}
				
				HashMap<String, Object> saveMap = new HashMap<String, Object>();
				saveMap.put("ATFL_UNQ_NO", ""); // 첨부파일고유번호
				saveMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
				saveMap.put("UNQ_NO", UNQ_NO);
				saveMap.put("ATFL_ID", ATFL_ID);
				
				saveMap.put("ATFL_TITL_NM", ATFL_TITL_NM);
				saveMap.put("ATFL_FEXT_NM", ATFL_FEXT_NM);
				
				saveMap.put("ATFL_PTH_NM", ATFL_PTH_NM);
				saveMap.put("ATFL_ORSRC_NM", ATFL_ORSRC_NM);
				saveMap.put("ATFL_PHCL_NM", ATFL_PHCL_NM);
				saveMap.put("ATFL_SZ", ATFL_SZ);
				
				return pelsFileService.insert("InsertFile", saveMap);
			}
		} else if("UPDATE".equals(callMethod)) {
			// fileUpdate 모드에 따른 처리...
			// 1) NO_CHANGED : 변화 없음
			// 2) DATA_UPDATE: 첨부파일 데이터만 변경(GE_PL_FILE_S)
			// 3) FILE_UPDATE: 첨부파일 변경(데이터+서버에 존재하는 파일)
			// 4) FILE_NEW   : 첨부파일 수정화면에서 신규 등록(데이터+서버에 존재하는 파일)
			FileUpdate fileUpdate = commonFileDto.getFileUpdate(); // 첨부파일 수정처리
			
			log.debug("commonFileSaveLogic callMethod: {}, fileUpdateMode: {} start...", callMethod, fileUpdate);
			switch(fileUpdate) {
				case DATA_UPDATE:
					// 첨부파일 테이블(GE_PL_FILE_S) 데이터만 업데이트
					HashMap<String, Object> dataUpdateMap = new HashMap<String, Object>();
					
					dataUpdateMap.put("ATFL_PTH_NM", "");
					dataUpdateMap.put("ATFL_ORSRC_NM", "");
					dataUpdateMap.put("ATFL_PHCL_NM", "");
					dataUpdateMap.put("ATFL_FEXT_NM", "");
					dataUpdateMap.put("ATFL_SZ", "");
					
					
					dataUpdateMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
					dataUpdateMap.put("UNQ_NO", UNQ_NO);
					dataUpdateMap.put("ATFL_ID", ATFL_ID);
					
					dataUpdateMap.put("ATFL_TITL_NM", ATFL_TITL_NM);
					
					int updateCnt = pelsFileService.update("UpdateFile", dataUpdateMap); 
					
					log.debug("commonFileSaveLogic callMethod: {}, fileUpdateMode: {} end...", callMethod, fileUpdate);
					return updateCnt;
				case FILE_UPDATE:
					Map uploadFileResultMap = null;
					if(mFile != null) {
						// 서버에 신규 첨부파일 업로드
						uploadFileResultMap = this.uploadFile(ATFL_GRUP_NM, mFile, ATFL_FEXT_NM);
					}
					
					// 파일서버 저장 성공시
					if(uploadFileResultMap != null) {
						// 서버에 존재하는 기존 파일경로 찾기
						String originFilePath = this.getFileSrc(ATFL_GRUP_NM, UNQ_NO, ATFL_ID);
						
						// 첨부파일 테이블(GE_PL_FILE_S) 데이터 업데이트
						ATFL_PTH_NM = (String) uploadFileResultMap.get("ATFL_PTH_NM"); // 첨부파일경로명
						ATFL_ORSRC_NM = (String) uploadFileResultMap.get("ATFL_ORSRC_NM"); // 첨부파일원래명
						ATFL_PHCL_NM = (String) uploadFileResultMap.get("ATFL_PHCL_NM"); // 첨부파일명
						
						if("ozr".contentEquals(ATFL_FEXT_NM)) {
							// OZD로 만든다.
							//
							HashMap paramsMap = new HashMap();
							HttpConnectionUtil HUtil = new HttpConnectionUtil();
						    paramsMap.put("ozrName", ATFL_GRUP_NM + "/" + ATFL_PHCL_NM + ".ozr");
						    paramsMap.put("ozdName", ATFL_GRUP_NM + "/" + ATFL_PHCL_NM + ".ozd");
						    String result2 = HUtil.postRequest(OZ_HOME + "/pels/ozr_ozd.jsp", paramsMap);	
						}

					    HashMap<String, Object> fileUpdateMap = new HashMap<String, Object>();
						
						fileUpdateMap.put("ATFL_UNQ_NO", ""); // 첨부파일고유번호
						fileUpdateMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
						fileUpdateMap.put("UNQ_NO", UNQ_NO);
						fileUpdateMap.put("ATFL_ID", ATFL_ID);
						
						fileUpdateMap.put("ATFL_TITL_NM", ATFL_TITL_NM);
						fileUpdateMap.put("ATFL_FEXT_NM", ATFL_FEXT_NM);
						
						fileUpdateMap.put("ATFL_PTH_NM", ATFL_PTH_NM);
						fileUpdateMap.put("ATFL_ORSRC_NM", ATFL_ORSRC_NM);
						fileUpdateMap.put("ATFL_PHCL_NM", ATFL_PHCL_NM);
						fileUpdateMap.put("ATFL_SZ", ATFL_SZ);
						
						int fileUpdateCnt = pelsFileService.update("UpdateFile", fileUpdateMap);
						
						// 서버에 존재하는 기존 첨부파일 삭제
						this.deleteFile(originFilePath);
						
						log.debug("commonFileSaveLogic callMethod: {}, fileUpdateMode: {} end...", callMethod, fileUpdate);
						return fileUpdateCnt;
					}
				case FILE_NEW:
					Map newFileResultMap = null;
					if(mFile != null) {
						// 서버에 신규 첨부파일 업로드
						newFileResultMap = this.uploadFile(ATFL_GRUP_NM, mFile, ATFL_FEXT_NM);
					}
					// 파일서버 저장 성공시
					if(newFileResultMap != null) {
						// 첨부파일 테이블(GE_PL_FILE_S) 데이터 업데이트
						ATFL_PTH_NM = (String) newFileResultMap.get("ATFL_PTH_NM"); // 첨부파일경로명
						ATFL_ORSRC_NM = (String) newFileResultMap.get("ATFL_ORSRC_NM"); // 첨부파일원래명
						ATFL_PHCL_NM = (String) newFileResultMap.get("ATFL_PHCL_NM"); // 첨부파일명
						
						if("ozr".contentEquals(ATFL_FEXT_NM)) {
							// OZD로 만든다.
							//
							HashMap paramsMap = new HashMap();
							HttpConnectionUtil HUtil = new HttpConnectionUtil();
						    paramsMap.put("ozrName", ATFL_GRUP_NM + "/" + ATFL_PHCL_NM + ".ozr");
						    paramsMap.put("ozdName", ATFL_GRUP_NM + "/" + ATFL_PHCL_NM + ".ozd");
						    String result2 = HUtil.postRequest(OZ_HOME + "/pels/ozr_ozd.jsp", paramsMap);	
						}

					    HashMap<String, Object> fileUpdateMap = new HashMap<String, Object>();
						
						fileUpdateMap.put("ATFL_UNQ_NO", ""); // 첨부파일고유번호
						fileUpdateMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
						fileUpdateMap.put("UNQ_NO", UNQ_NO);
						fileUpdateMap.put("ATFL_ID", ATFL_ID);
						
						fileUpdateMap.put("ATFL_TITL_NM", ATFL_TITL_NM);
						fileUpdateMap.put("ATFL_FEXT_NM", ATFL_FEXT_NM);
						
						fileUpdateMap.put("ATFL_PTH_NM", ATFL_PTH_NM);
						fileUpdateMap.put("ATFL_ORSRC_NM", ATFL_ORSRC_NM);
						fileUpdateMap.put("ATFL_PHCL_NM", ATFL_PHCL_NM);
						fileUpdateMap.put("ATFL_SZ", ATFL_SZ);
						
						int fileNewUpdateCnt = pelsFileService.insert("InsertFile", fileUpdateMap);
						
						log.debug("commonFileSaveLogic callMethod: {}, fileUpdateMode: {} end...", callMethod, fileUpdate);
						return fileNewUpdateCnt;
					}
				case NO_CHANGED:
				default:
					log.debug("commonFileSaveLogic callMethod: {}, fileUpdateMode: {} end...", callMethod, fileUpdate);
					return 0;
			}
		} else if("DELETE".equals(callMethod)) {
			if(!"".equals(ATFL_GRUP_NM) && !"".equals(UNQ_NO)){
				return this.deleteFileProcess(ATFL_GRUP_NM, UNQ_NO);
			}
		} else {
			log.debug("commonFileSaveLogic is unclassified... callMethod: {} end...", callMethod);
		}
		
		return 0;
	}
	
	/**
	 * 파일 데이터 존재여부 체크...
	 */
	@Override
	public boolean hasFileData(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID) {
		HashMap<String, Object> fileDataCheckMap = new HashMap<String, Object>();
		
		fileDataCheckMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
		fileDataCheckMap.put("UNQ_NO", UNQ_NO);
		fileDataCheckMap.put("ATFL_ID", ATFL_ID);
		
		
		return pelsFileService.getCount("FileCount", fileDataCheckMap) > 0;
	}
	
	/**
	 * 첨부파일제목명 조회
	 */
	@Override
	public String getAtflTitlNm(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID) {
		String atflTitlNm = "";
		
		HashMap<String, Object> fileMap = new HashMap<String, Object>();
		
		fileMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
		fileMap.put("UNQ_NO", UNQ_NO);
		fileMap.put("ATFL_ID", ATFL_ID);
		
		try {
			List<Map> fileList = pelsFileService.getList("FileList", fileMap);
			
			if(fileList != null && fileList.size() > 0) {
				atflTitlNm = fileList.get(0).get("ATFL_TITL_NM").toString();
			}
		} catch(Exception e) {
			log.error("getAtflTitlNm error: {}", e.getMessage(), e);
		}
		
		return atflTitlNm;
	}
	
	/**
	 * 파일 삭제 처리(하나만)
	 * @param ATFL_GRUP_NM 첨부파일그룹명(테이블명)
	 * @param UNQ_NO 고유번호
 	 * @param ATFL_ID 첨부파일ID
	 * @return
	 */
	@Override
	public int deleteFileProcess(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID) {
		int deleteCnt = 0;
		HashMap<String, Object> searchMap = new HashMap<String, Object>();
		searchMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
		searchMap.put("UNQ_NO", UNQ_NO);
		searchMap.put("ATFL_ID", ATFL_ID);
		
		// 첨부파일(GE_MP_FILE_S) 데이터 조회
		List<HashMap<String, String>> fileList = pelsFileService.getList("FileDetail", searchMap);
		
		if(fileList != null && fileList.size() > 0) {
			HashMap<String,Object> deleteMap = new HashMap<String,Object>();
			
			deleteMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
			deleteMap.put("UNQ_NO", UNQ_NO);
			deleteMap.put("ATFL_ID", ATFL_ID);
			
			// 첨부파일(GE_MP_FILE_S) 데이터 삭제
			deleteCnt = pelsFileService.delete("DeleteFile", deleteMap);
			
			for(HashMap<String, String> deleteFileMap : fileList) {
				// 파일경로
				String filePath = deleteFileMap.get("ATFL_PTH_NM") + deleteFileMap.get("ATFL_PHCL_NM") + "." + deleteFileMap.get("ATFL_FEXT_NM");
				// 서버에 저장된 파일 삭제
				this.deleteFile(filePath);
			}
		}
		return deleteCnt;
	}
	
	/**
	 * 파일 삭제 처리(고유번호 일치하는 것 전부)
	 * @param ATFL_GRUP_NM 첨부파일그룹명(테이블명)
	 * @param UNQ_NO 고유번호
	 * @return
	 */
	@Override
	public int deleteFileProcess(String ATFL_GRUP_NM, String UNQ_NO) {
		int deleteCnt = 0;
		HashMap<String, Object> searchMap = new HashMap<String, Object>();
		searchMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
		searchMap.put("UNQ_NO", UNQ_NO);
		searchMap.put("ATFL_ID", "");
		
		// 첨부파일(GE_PL_FILE_S) 데이터 조회
		List<HashMap<String, String>> fileList = pelsFileService.getList("FileList", searchMap);
		
		if(fileList != null && fileList.size() > 0) {
			HashMap<String,Object> deleteMap = new HashMap<String,Object>();
			
			deleteMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
			deleteMap.put("UNQ_NO", UNQ_NO);
			deleteMap.put("ATFL_ID", "");
			
			// 첨부파일(GE_PL_FILE_S) 데이터 삭제
			deleteCnt = pelsFileService.delete("DeleteFile", deleteMap);
			
			for(HashMap<String, String> deleteFileMap : fileList) {
				// 파일경로
				String filePath = deleteFileMap.get("ATFL_PTH_NM") + deleteFileMap.get("ATFL_PHCL_NM") + "." + deleteFileMap.get("ATFL_FEXT_NM");
				// 서버에 저장된 파일 삭제
				this.deleteFile(filePath);
			}
		}
		return deleteCnt;
	}
	
	/**
	 * 파일을 저장하고, 저장된 파일 데이터를 리턴한다.
	 * @param folderName 폴더명
	 * @param mFile 파일
	 * @param extName 확장자
	 * @return isSuccess(저장결과), ATFL_ORSRC_NM(원래파일명), ATFL_PHCL_NM(저장파일명)
	 * @throws ServletException
	 */
	private Map uploadFile(String folderName, MultipartFile mFile, String extName) throws Exception {
		Map<String, Object> returnMap = new HashMap<String, Object>();
		boolean isSuccess = false;
		
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");

		/*
		 * 임시 상위폴더 체크 및 생성 시작...
		 */
		String pelsPath = PELS_DIR;   // "C:/pels"
		String upperPath = pelsPath + "/upload";
		
		File pelsFolder = new File(pelsPath);

		// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
		if (!pelsFolder.exists()) {
			pelsFolder.mkdir(); //폴더 생성합니다.
		}
		File upperFolder = new File(upperPath);

		// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
		if (!upperFolder.exists()) {
			upperFolder.mkdir(); //폴더 생성합니다.
		}
		/*
		 * 임시 상위폴더 체크 및 생성 종료...
		 */
		
		String uploadPath = upperPath + "/" + folderName + "/";
		
		File folder = new File(uploadPath);

		// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
		if (!folder.exists()) {
			folder.mkdir(); //폴더 생성합니다.
		}
		
		String orgFileName = mFile.getOriginalFilename();
        
        int index = orgFileName.lastIndexOf(".");
        String fileExt = orgFileName.substring(index + 1);
        orgFileName = orgFileName.substring(0, index);
        
        if (orgFileName != null && !orgFileName.isEmpty()) {
        	orgFileName = orgFileName.replaceAll("\\.{2,}[/\\\\]", "");
        	orgFileName = orgFileName.replaceAll("&", "");
        }
		
		File file = null;
		String filename1 = format.format(new Date());
		Thread.sleep((int)(Math.random() * 10));
		String filename2 = format2.format(new Date());
		String filename3 = ((int)(Math.random() * 899)) + 100 + "";
		
		String ATFL_PHCL_NM = filename1 +"_"+ filename2 + "_" + filename3;
//		String ATFL_PHCL_NM = format.format(new Date())+"_"+ orgFileName;
		String newfileName = ATFL_PHCL_NM + "." + fileExt;
		
		if(fileExt.equals("pdf")) {
	        String tmpfileName = format.format(new Date())+"_tmp" + "." + fileExt;
	        if (newfileName != null && !newfileName.equals("")) {
	        	if (newfileName.toLowerCase().endsWith(extName)) {
		            
	        		String srcFile, dstFile;
	        		srcFile = uploadPath + tmpfileName;
	        		dstFile = uploadPath + newfileName;
	        		
	            	try {
	                    file = new File(srcFile);
	                    mFile.transferTo(file);    
	                    
	                    // 복호화 처리
	                    SLDsFile sFile = new SLDsFile();
	                    
	                    sFile.SettingPathForProperty("c:\\softcamp\\02_Module\\02_ServiceLinker\\softcamp.properties");
	                    int retVal = sFile.CreateDecryptFileDAC("c:\\softcamp\\04_KeyFile\\keyDAC_SVR0.sc", "SECURITYDOMAIN", srcFile, dstFile);
	                    if(retVal != 0 && retVal != 36) {
	                        File file2 = null;
		                    file2 = new File(dstFile);
		                    mFile.transferTo(file2);    
	                    }
	                    
	                    file.delete();
	            		
	                    isSuccess = true;
	                } catch (IOException e) {
	                    log.error("Error occured !!! Method :: uploadFile > {}, error > {}", folderName, e.getMessage(), e);
	                    throw e;
	                } 
	            	
	        	} else {
	        		log.error("Error occured !!! Method :: uploadFile > {}, extName checkFail... fileExt > {}, expectedFileExt > {}", folderName, fileExt, extName);
	        		throw new ServletException("");
	        	}
	        }
		}
		else {
	        if (newfileName != null && !newfileName.equals("")) {
	        	if (newfileName.toLowerCase().endsWith(extName)) {
		            
	        		String srcFile;
	        		srcFile = uploadPath + newfileName;
	            	try {
	                    file = new File(srcFile);
	                    mFile.transferTo(file);
	                    isSuccess = true;
	                } catch (IOException e) {
	                    log.error("Error occured !!! Method :: uploadFile > {}, error > {}", folderName, e.getMessage(), e);
	                    throw e;
	                } 
	            	
	        	} else {
	        		log.error("Error occured !!! Method :: uploadFile > {}, extName checkFail... fileExt > {}, expectedFileExt > {}", folderName, fileExt, extName);
	        		throw new ServletException("");
	        	}
	        }
		}
		
		// isSuccess(저장결과), ATFL_ORSRC_NM(원래파일명), ATFL_PHCL_NM(저장파일명)
        returnMap.put("isSuccess", isSuccess);
        returnMap.put("ATFL_PTH_NM", uploadPath);
        returnMap.put("ATFL_ORSRC_NM", orgFileName);
        returnMap.put("ATFL_PHCL_NM", ATFL_PHCL_NM);
        
		return returnMap;
	}
	
	/**
	 * 서버에 업로드된 파일을 찾아 삭제한다.
	 * @param filePath 파일경로
	 * @return
	 */
	private String deleteFile(String filePath) {
		String message = "";
		File file = new File(filePath);
		if (file.exists()) {
			if (file.delete()) {
				message = "delete file success.";
			} else {
				message = "delete file fail.";
			}
		} else {
			message = "file not exists.";
		}
		log.debug("deleteFile message > {}, filePath > {}", message, filePath);
		return message;
	}
	
	/**
	 * 파일경로 가져오기...
	 * @param ATFL_GRUP_NM 첨부파일 그룹명
	 * @param UNQ_NO 고유번호
	 * @param ATFL_ID 첨부파일ID
	 * @return
	 */
	@Override
	public String getFileSrc(String ATFL_GRUP_NM, String UNQ_NO, String ATFL_ID) {
		String fileSrc = "";
		
		HashMap<String, Object> searchMap = new HashMap<String, Object>();
		searchMap.put("ATFL_GRUP_NM", ATFL_GRUP_NM);
		searchMap.put("UNQ_NO", UNQ_NO);
		searchMap.put("ATFL_ID", ATFL_ID);
		
		Map<String, String> fileDetail = pelsFileService.getDetail("FileDetail", searchMap);
		
		if(fileDetail != null) {
			fileSrc = fileDetail.get("ATFL_PTH_NM") + fileDetail.get("ATFL_PHCL_NM") + "." + fileDetail.get("ATFL_FEXT_NM");
		}
		
		log.debug("getFileSrc > fireSrc: {}", fileSrc);
		
		return fileSrc;
	}
}
