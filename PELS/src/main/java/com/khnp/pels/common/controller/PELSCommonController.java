package com.khnp.pels.common.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.common.service.PELSFileLogicService;
import com.khnp.pels.common.service.PELSFileService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSCommonController {
	private static final Logger log = LoggerFactory.getLogger(PELSCommonController.class);

	@Autowired
	private PELSFileLogicService pelsFileLogicService;
	
	@Autowired
	private PELSFileService pelsFileService;

	@Resource(name = "utilProperties")
	private Properties utilProperties;
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();	
	
	@RequestMapping(value = "{path}.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView MatchingPath(@PathVariable String path, HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		HttpSession session = request.getSession();
		
		if ("/index.do".equals(request.getRequestURI()) && (StringUtil.isNull((String) session.getAttribute("LOGIN_USER_ID")))) {
			mav.setViewName("redirect:PELS_Login.do");
			return mav;
		}
		else if ("/index2.do".equals(request.getRequestURI())) {
			session.setAttribute("LOGIN_USER_ID", "M1EU0004");
			session.setAttribute("LOGIN_USER_NM", "개발자");
			session.setAttribute("LOGIN_DIVS_CD", "333");
			session.setAttribute("LOGIN_PPCD", "3330");
			session.setAttribute("LOGIN_PWPL_CFY", "2");
			session.setAttribute("LOGIN_PPCD_NM", "무주양수발전소");
			session.setAttribute("LOGIN_TYPE_CD", "2");
			
			mav.addObject("LOGIN_USER_NM", "개발자");
			mav.addObject("LOGIN_PPCD_NM", "무주양수발전소");
		}	
		else if ("/index3.do".equals(request.getRequestURI())) {
			session.setAttribute("LOGIN_USER_ID", "M1EU0004");
			session.setAttribute("LOGIN_USER_NM", "개발자");
			session.setAttribute("LOGIN_DIVS_CD", "333");
			session.setAttribute("LOGIN_PPCD", "3330");
			session.setAttribute("LOGIN_PWPL_CFY", "2");
			session.setAttribute("LOGIN_PPCD_NM", "무주양수발전소");
			session.setAttribute("LOGIN_TYPE_CD", "2");
			
			mav.addObject("LOGIN_USER_NM", "개발자");
			mav.addObject("LOGIN_PPCD_NM", "무주양수발전소");
			
			mav.setViewName("/pels/index");
			return mav;
		}	
		mav.setViewName("/pels/" + path);
		

		return mav;
	}
	
	@RequestMapping(value = "Main.do", method = { RequestMethod.GET, RequestMethod.POST })
	public ModelAndView MainPage(HttpServletRequest request) {
		ModelAndView mav = new ModelAndView();
		
		HttpSession session = request.getSession();

		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("USER_ID", USER_ID);
		
		paramMap.put("CHCK_STRT_DT", "");
		paramMap.put("CHCK_END_DT", "");
		
		paramMap.put("FRM_UNQ_KY_VAL", "");
		paramMap.put("PRCDOC_CFY", "P");
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		paramMap.put("TITL_NM", "");
		
		paramMap.put("PRSTS_CFY", "");
		paramMap.put("PRSTS_CFY_M", "'R', 'A', 'F'");  // 진행상태구분 R:준비, A:허가, F:수행, S:정지, C:완료
		
		paramMap.put("DISPSTART", 1);
		paramMap.put("DISPEND", 8);
		paramMap.put("SH_SORT", "CHCK_STRT_DT");
		
		ArrayList examList1 = null;
		mav.addObject("examList1", examList1);
	
		paramMap.put("PRCDOC_CFY", "M");
		
		ArrayList examList2 = null;
		mav.addObject("examList2", examList2);
		
		paramMap.put("GRUP_CFY_CD", "A");
		paramMap.put("BLBR_TITL_NM", "");		
		
		ArrayList boardList1 = null; // 정주기시험 리스트
		mav.addObject("boardList1", boardList1);

		paramMap.put("GRUP_CFY_CD", "C");

		ArrayList boardList2 = null; // 정주기시험 리스트
		mav.addObject("boardList2", boardList2);
		
		mav.setViewName("/pels/Main");
		
		return mav;
	}
	
	@RequestMapping(value = "GetPlantCode.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> GetPlantCode(HttpServletRequest request) {
		String PWPL_CFY = request.getParameter("PWPL_CFY");

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("PWPL_CFY", PWPL_CFY);

		List plantCodeList = new ArrayList();
		if (PWPL_CFY.equals("3")) { // 원자력 발전소일때
			plantCodeList = (ArrayList) pelsFileService.getList("GetPlantHead", paramMap);
		} else {
			plantCodeList = (ArrayList) pelsFileService.getList("GetPlantCode", paramMap);
		}

		Map resultMap = new HashMap<String, Object>();
		resultMap.put("plantCodeList", plantCodeList);

		return resultMap;
	}

	@RequestMapping(value="/FileDownload.do")
	public void FileDownload(HttpServletRequest request, HttpServletResponse response) throws Exception 
	{
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");

		String ATFL_PHCL_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("ATFL_PHCL_NM"), ""));
		String ATFL_ORSRC_NM = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("ATFL_ORSRC_NM"), ""));
		
		String FullFileName = PELS_DIR + "/upload/" + ATFL_PHCL_NM;
		
		File file = new File(FullFileName);
		
		response.setContentType("application/otest-stream");
		response.setContentLength((int) file.length());
	
		String OutPut_FileName = URLEncoder.encode(ATFL_ORSRC_NM, "utf-8");
		
		response.setHeader("Content-Disposition", "attachment;fileName=\""+ OutPut_FileName + "\";");
		response.setHeader("Content-Transfer-Encoding", "binary");
		OutputStream out = response.getOutputStream();
		FileInputStream fis = null;
		
		try {
			fis = new FileInputStream(file);
			FileCopyUtils.copy(fis, out);
			
		} finally {
			if(fis != null) try {fis.close();} catch (IOException e) {}
		}
		
		out.flush();
	}
	
    private String cleanXSS(String value) {
    	//You'll need to remove the spaces from the html entities below
        value = value.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
        value = value.replaceAll("&#40;", "\\(").replaceAll("&#41;", "\\)");
        value = value.replaceAll("&#39;", "'");
        //value = value.replaceAll("eval\\((.*)\\)", "");
        //value = value.replaceAll("[\\\"\\\'][\\s]*javascript:(.*)[\\\"\\\']", "\"\"");
        //value = value.replaceAll("script", "");
        return value;
    }
    
	@RequestMapping(value = "/FileUpload.do", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> FileUpload (HttpServletRequest request) throws Exception {
		
		String PELS_DIR = utilProperties.getProperty("PELS_DIR");
		
		SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmssSSS", java.util.Locale.KOREA);
		SimpleDateFormat format2 = new SimpleDateFormat("yyyyMMddHHmmSSSss", java.util.Locale.KOREA);
		SimpleDateFormat format_yyyymm = new SimpleDateFormat("yyyyMM", java.util.Locale.KOREA);
		SimpleDateFormat format_dd = new SimpleDateFormat("dd", java.util.Locale.KOREA);
		
		Date nowDate = new Date();

		String filename1 = format.format(new Date());
		String filename2 = format2.format(new Date());
		String filename3 = ((int)(Math.random() * 899)) + 100 + "";
		String dirpath1 = format_yyyymm.format(nowDate);
		String dirpath2 = format_dd.format(nowDate);
		String filepath  = dirpath1 + "/" + dirpath2; 
		
		File mppsFolder = new File(PELS_DIR + "/upload/" + dirpath1);

		// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
		if (!mppsFolder.exists()) {
			mppsFolder.mkdir(); //폴더 생성합니다.
		}
		File upperFolder = new File(PELS_DIR + "/upload/" + dirpath1 + "/" + dirpath2);

		// 해당 디렉토리가 없을경우 디렉토리를 생성합니다.
		if (!upperFolder.exists()) {
			upperFolder.mkdir(); //폴더 생성합니다.
		}

		Map resultMap = new HashMap<String, Object>();
		
		MultipartHttpServletRequest mReq = (MultipartHttpServletRequest) request;
		Iterator<String> iterator = mReq.getFileNames();
		while (iterator.hasNext()) {
			String uploadFileName = iterator.next();
			CommonsMultipartFile mFile = (CommonsMultipartFile) mReq.getFile(uploadFileName);
			
            if(mFile != null && !mFile.isEmpty() && mFile.getSize() > 0) {
            	FileItem fileItem = mFile.getFileItem();
                String fieldName = fileItem.getFieldName();
                
                String fileExt = "";
                String orgFileName = mFile.getOriginalFilename();
                int index = orgFileName.lastIndexOf(".");
                if(index >= 0) 
                   fileExt = orgFileName.substring(index + 1);
                
                System.out.println("==============================================");
                System.out.println("orgFileName = " + orgFileName);
                System.out.println("fileExt = " + fileExt);
                System.out.println("==============================================");
        		
        		String ATFL_PHCL_NM = filename1 +"_"+ filename2 + "_" + filename3;
        		String newfileName = ATFL_PHCL_NM + "." + fileExt;
        		
                File file = new File(PELS_DIR + "/upload/" + dirpath1 + "/" + dirpath2 + "/" + newfileName);
                mFile.transferTo(file);   
                
                resultMap.put("FILE_PATH", "upload/" + filepath + "/" + newfileName);
            }
		}
		
		return resultMap;
	}    
	
    @RequestMapping(value= {"/e-link-v2/**"}, method = {RequestMethod.GET, RequestMethod.POST})
    public String forward (HttpServletRequest request) {
        return "forward:/static/e-link-v2/index.html";
    }	
}

