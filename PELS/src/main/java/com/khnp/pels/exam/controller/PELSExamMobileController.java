package com.khnp.pels.exam.controller;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Clob;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.khnp.pels.exam.service.PELSExamService;
import com.khnp.pels.api.service.ExamPdfService;

import common.util.StringUtil;
import common.xss.JsonXssFilter;

@Controller
public class PELSExamMobileController {

	private static final Logger log = LoggerFactory.getLogger(PELSExamMobileController.class);

	/** 외부 클라이언트 디버깅용: 파라미터 로그 최대 길이 */
	private static final int LOG_PARAM_MAX_LEN = 2000;

	/** 로그에서 null/empty 즉시 식별용 마커 (비즈니스 로직과 무관, 출력 전용) */
	private static final String LOG_NULL_MARKER = "NULL";
	private static final String LOG_EMPTY_MARKER = "EMPTY";

//	private final PdfService pdfService;

	@Autowired
	private ExamPdfService examPdfService;

	@Autowired
	private PELSExamService pelsExamService;

	private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	
	private JsonXssFilter jsonXssFilter = new JsonXssFilter();
	
	@Resource(name = "utilProperties")
	private Properties utilProperties;

	/*
	 * Exam_Search_M.do
	 * 점검조회
	 * 
	 */
	@RequestMapping(value= {"/Exam_Search_M.do"}, method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
	@ResponseBody
	public List<Map<String, Object>> Exam_Search_M (HttpServletRequest request) {
		logIncomingRequest(request, "Exam_Search_M");
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); 
		String PRSTS_CFY = StringUtil.nvl(request.getParameter("PRSTS_CFY"), ""); 
		
		paramMap.put("CHCK_STRT_DT", "");
		paramMap.put("CHCK_END_DT", "");
		
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		paramMap.put("CHCK_TITL", "");
		paramMap.put("PRSTS_CFY", PRSTS_CFY);
		paramMap.put("SH_SORT", "CHCK_STRT_DT");
		
		int DISPSTART = 0, DISPEND = 100;
		paramMap.put("DISPSTART", DISPSTART);
		paramMap.put("DISPEND", DISPEND);
		
		// 진행상태구분 R:준비, A:허가 F:수행, S:불만족, C:완료, X:불만족완료
		paramMap.put("CHKPR_ID", USER_ID);
		
		List<Map<String, Object>> examList = (ArrayList) pelsExamService.getList("ExamList", paramMap);
		if (examList == null) {
			log.warn("[PELSExamMobile] <<< Exam_Search_M | examList={}", LOG_NULL_MARKER);
		} else {
			log.info("[PELSExamMobile] <<< Exam_Search_M | resultSize={}", examList.size());
		}
		return examList;
	}
	
	@RequestMapping(value= {"/Exam_Detail_M.do"}, method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
	@ResponseBody
	public Map<String, Object> Exam_Detail_M (HttpServletRequest request) {
		logIncomingRequest(request, "Exam_Detail_M");
		ModelAndView mav = new ModelAndView();
		HashMap<String, Object> paramMapReturn = new HashMap<String, Object>();

		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		String PELS_IP_URL = utilProperties.getProperty("PELS_IP_URL");
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), ""); 
		
		paramMap.put("CHCK_SNO", CHCK_SNO);
		Map<String, String> examDetail = pelsExamService.getDetail("ExamDetail", paramMap);
		paramMapReturn.put("PRCDOC_NO", examDetail.get("PRCDOC_NO"));
		paramMapReturn.put("PRCDOC_NM", examDetail.get("PRCDOC_NM"));
		paramMapReturn.put("DOC_TYP_CD", examDetail.get("DOC_TYP_CD"));
		paramMapReturn.put("PRT_NO", examDetail.get("PRT_NO"));
		paramMapReturn.put("FM_CHCK_STRT_DT", examDetail.get("FM_CHCK_STRT_DT"));
		paramMapReturn.put("FM_CHCK_END_DT", examDetail.get("FM_CHCK_END_DT"));
		paramMapReturn.put("CHCK_TITL", examDetail.get("CHCK_TITL"));
		paramMapReturn.put("CHKPR_ID", examDetail.get("CHKPR_ID"));
		paramMapReturn.put("CHKPR_FNM", examDetail.get("CHKPR_FNM"));
		paramMapReturn.put("PRSTS_CFY", examDetail.get("PRSTS_CFY"));
		paramMapReturn.put("PRSTS_CFY_NM", examDetail.get("PRSTS_CFY_NM"));
		
		paramMap.put("CHCK_SNO", CHCK_SNO);
		paramMap.put("ATFL_NO", "1");
		Map<String, String> examJsonDetail = pelsExamService.getDetail("ExamJsonDetail", paramMap);
		
		paramMapReturn.put("PDF_PATH", PELS_IP_URL + "/upload/" + examJsonDetail.get("ATFL_PHCL_NM"));
		Object clobObj = examJsonDetail.get("WRTE_JSON_DCR");
		String json = "";
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMapReturn.put("FRM_OVER_JSON", json);
		
		clobObj = examJsonDetail.get("CMP_JSON_DCR");
		try {
			json = clobToString((Clob) clobObj);
		}
		catch(Exception e) {}
		paramMapReturn.put("FRM_CONS_JSON", json);
		logField("Exam_Detail_M [RESPONSE]", "CHCK_SNO", CHCK_SNO);
		logField("Exam_Detail_M [RESPONSE]", "examDetail", examDetail);
		logMapFields("Exam_Detail_M", "RESPONSE", paramMapReturn);
		return paramMapReturn;
	}
	
	public static String clobToString(Clob clob) throws Exception {
	    if (clob == null) return null;

	    StringBuilder sb = new StringBuilder();
	    try (Reader reader = clob.getCharacterStream();
	         BufferedReader br = new BufferedReader(reader)) {

	        char[] buffer = new char[8192]; // 8KB
	        int length;
	        while ((length = br.read(buffer)) != -1) {
	            sb.append(buffer, 0, length);
	        }
	    }
	    
	    return sb.toString();
	}
	
	
	/**
	 * 시험상태 저장
	 * @param request
	 * @return
	 * @throws ServletException 
	 */
	@RequestMapping(value={"/Exam_CFY_Update_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> Exam_CFY_Update (HttpServletRequest request) throws Exception {
		logIncomingRequest(request, "Exam_CFY_Update_M");
		Map<String, String> resultMap = new HashMap<String, String>();
		
		String CHCK_SNO = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("CHCK_SNO"), ""));
		String PRSTS_CFY = jsonXssFilter.cleanXSS(StringUtil.nvl(request.getParameter("PRSTS_CFY"), ""));
		
		String resultMsg = "";
		String resultCd = "false";
		
		try {
			HashMap<String, Object> map = new HashMap<String, Object>();
			map.put("CHCK_SNO", CHCK_SNO);
			map.put("PRSTS_CFY", PRSTS_CFY);
	
			pelsExamService.update("UpdateCheck_CFY", map);
			
			resultMsg = "저장에 성공하였습니다.";
			resultCd = "true";
		} catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "Exam_CFY_Update");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		logMapFields("Exam_CFY_Update_M", "RESPONSE", resultMap);
		return resultMap;
	}
	
	
	@RequestMapping(value={"/Exam_JsonSave_M.do"} , method={RequestMethod.GET, RequestMethod.POST})
	@ResponseBody
	public Map<String, String> formJsonSave (HttpServletRequest request) throws Exception {
		logIncomingRequest(request, "Exam_JsonSave_M");
		Map<String, String> resultMap = new HashMap<String, String>();
		String resultMsg = "저장 되었습니다.";
		String resultCd = "false";
		
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		
		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");
		String ATFL_NO = StringUtil.nvl(request.getParameter("ATFL_NO"), "1");
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), "");
		String USER_NM = StringUtil.nvl(request.getParameter("USER_NM"), "");
		String FRM_OVER_JSON = StringUtil.nvl(request.getParameter("FRM_OVER_JSON"), "");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		try {
			paramMap.clear();
			paramMap.put("CHCK_SNO", CHCK_SNO);
			paramMap.put("ATFL_NO", "1");
			paramMap.put("REGPR_ID", USER_ID);
			paramMap.put("REGPR_NM", USER_NM);
			paramMap.put("WRTE_JSON_DCR", FRM_OVER_JSON);
				
			pelsExamService.update("UpdateExamJson", paramMap);
			
			resultCd = "true";
		} 
		catch(Exception e) {
			resultMsg = "저장에 실패하였습니다.";
			log.error("formSave error > {}", e.getMessage(), e);
		}
		
		resultMap.put("callMethod", "Exam_JsonSave");
		resultMap.put("resultMsg", resultMsg);
		resultMap.put("resultCd", resultCd);
		logMapFields("Exam_JsonSave_M", "RESPONSE", resultMap);
		return resultMap;
	}

	/* 추가시작 */
	@RequestMapping(value = "/api/Exam_Json_M", method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
	@ResponseBody
	public Map<String, Object> Exam_Json_M_API(HttpServletRequest request) throws Exception {
		logIncomingRequest(request, "Exam_Json_M_API");
		logSessionAttributes(request, "Exam_Json_M_API");

		String PELS_IP_URL = utilProperties.getProperty("PELS_IP_URL");
		
		HttpSession session = request.getSession();
		String USER_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String USER_NM = (String) session.getAttribute("LOGIN_USER_NM");

		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");

		Map<String, Object> result = new HashMap<>();
		result.put("USER_ID", USER_ID);
		result.put("USER_NM", USER_NM);
		logField("Exam_Json_M_API [resolved]", "USER_ID(session)", USER_ID);
		logField("Exam_Json_M_API [resolved]", "USER_NM(session)", USER_NM);
		logParamValue("Exam_Json_M_API [resolved]", "CHCK_SNO", CHCK_SNO);

		if ("".equals(CHCK_SNO)) {
			log.warn("[PELSExamMobile] <<< Exam_Json_M_API | CHCK_SNO is empty, early return");
			return result;
		}

		/*
		 * ========================= 1. 시험 기본 정보 조회 =========================
		 */
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("CHCK_SNO", CHCK_SNO);
		paramMap.put("ATFL_NO", "1");
		Map<String, String> mapTemp = pelsExamService.getDetail("ExamJsonDetail", paramMap);
		
		if (mapTemp == null) {
			log.warn("[PELSExamMobile] <<< Exam_Json_M_API | ExamJsonDetail not found for CHCK_SNO={}", CHCK_SNO);
			return result;
		}

		/*
		 * ========================= 2. PDF 경로 =========================
		 */
		logField("Exam_Json_M_API [DB]", "ATFL_PHCL_NM", mapTemp.get("ATFL_PHCL_NM"));
		result.put("PDF_PATH", PELS_IP_URL + "/upload/" + mapTemp.get("ATFL_PHCL_NM"));
		logField("Exam_Json_M_API [RESPONSE]", "PDF_PATH", result.get("PDF_PATH"));

		/*
		 * ========================= 3. Overlay JSON =========================
		 */
		Object overClob = mapTemp.get("WRTE_JSON_DCR");
		logField("Exam_Json_M_API [DB]", "WRTE_JSON_DCR", overClob);
		if (overClob instanceof Clob) {
			result.put("FRM_OVER_JSON", clobToString((Clob) overClob));
		} else {
			result.put("FRM_OVER_JSON", null);
		}

		/*
		 * ========================= 4. Rule JSON =========================
		 */
		Object consClob = mapTemp.get("CMP_JSON_DCR");
		logField("Exam_Json_M_API [DB]", "CMP_JSON_DCR", consClob);
		if (consClob instanceof Clob) {
			result.put("FRM_CONS_JSON", clobToString((Clob) consClob));
		} else {
			result.put("FRM_CONS_JSON", null);
		}

		logMapFields("Exam_Json_M_API", "RESPONSE", result);
		return result;
	}

	@RequestMapping(value = "/api/Exam_Pdf_Download_M", method = RequestMethod.GET)
	@ResponseBody
	public void Exam_Pdf_Download_M_API(HttpServletRequest request, HttpServletResponse response) throws Exception {

		String CHCK_SNO = StringUtil.nvl(request.getParameter("CHCK_SNO"), "");

		if ("".equals(CHCK_SNO)) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "CHCK_SNO is required");
			return;
		}

		HashMap<String, Object> paramMap = new HashMap<>();

		paramMap.put("CHCK_SNO", CHCK_SNO);
		paramMap.put("ATFL_NO", "1");

		Map<String, String> mapTemp = pelsExamService.getDetail("ExamJsonDetail", paramMap);

		if (mapTemp == null) {
			response.sendError(HttpServletResponse.SC_NOT_FOUND, "data not found");
			return;
		}

		String PELS_IP_URL = this.utilProperties.getProperty("PELS_IP_URL");
		String pdfPath = PELS_IP_URL + "/upload/" + mapTemp.get("ATFL_PHCL_NM");
		String overJson = "";
		Object overClob = mapTemp.get("WRTE_JSON_DCR");
		if (overClob instanceof Clob) {
			overJson = clobToString((Clob) overClob);
		}
		if (overJson == null || "".equals(overJson)) {
			response.sendError(HttpServletResponse.SC_NOT_FOUND, "Overlay JSON not found");
			return;
		}
		byte[] pdfBytes = examPdfService.generateExamPdf(pdfPath, overJson);
		response.setContentType("application/pdf");
		response.setHeader("Content-Disposition", "attachment; filename=\"result.pdf\"");
		response.setContentLength(pdfBytes.length);
		response.getOutputStream().write(pdfBytes);
		response.getOutputStream().flush();
	}

	/* 추가끝 */
	
	@RequestMapping(value = "/proxy/pdf", method = RequestMethod.GET)
	public void proxyPdf(@RequestParam("path") String path, HttpServletRequest request, HttpServletResponse response) throws Exception {
		logIncomingRequest(request, "proxy/pdf");
		logParamValue("proxy/pdf", "path", path);

		URL url = new URL(path);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.setConnectTimeout(15000);
		conn.setReadTimeout(15000);

		response.setContentType("application/pdf");
		response.setHeader("Content-Disposition", "inline; filename=form.pdf");

		try (InputStream is = conn.getInputStream(); OutputStream os = response.getOutputStream()) {
			byte[] buffer = new byte[8192];
			int len;
			while ((len = is.read(buffer)) != -1) {
				os.write(buffer, 0, len);
			}
			os.flush();
		}
	}

    @RequestMapping(value = "/proxy/file", method = RequestMethod.GET)
    public void proxyFile(@RequestParam("path") String path, HttpServletRequest request, HttpServletResponse response) throws Exception {
        logIncomingRequest(request, "proxy/file");
        logParamValue("proxy/file", "path", path);

        URL url = new URL(path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(15000);

        String contentType = conn.getContentType();
        int contentLength = conn.getContentLength();

        if (contentType != null && !"".equals(contentType)) {
            response.setContentType(contentType);
        } else {
            response.setContentType("application/octet-stream");
        }

        if (contentLength > 0) {
            response.setContentLength(contentLength);
        }

        try (InputStream is = conn.getInputStream(); OutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = is.read(buffer)) != -1) {
                os.write(buffer, 0, len);
            }
            os.flush();
        }
    }
	
	/**
	 * 시험(점검)관리 > 시험(점검)준비 > 시험(점검)준비 등록
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/Exam_Input_M.do", method = {RequestMethod.GET, RequestMethod.POST})
	public ModelAndView Exam_Input_M (HttpServletRequest request) {
		logIncomingRequest(request, "Exam_Input_M");
		
		HashMap<String, Object> paramMap = new HashMap<String, Object>();
		
		ModelAndView mav = new ModelAndView();
		
		String SH_DOC_TYP_CD = StringUtil.nvl(request.getParameter("SH_DOC_TYP_CD"), "");
		String SH_PRCDOC_NO = StringUtil.nvl(request.getParameter("SH_PRCDOC_NO"), "");
		String SH_PRT_NO = StringUtil.nvl(request.getParameter("SH_PRT_NO"), "");
		String USER_ID = StringUtil.nvl(request.getParameter("USER_ID"), ""); 
		
		logParamValue("Exam_Input_M [resolved]", "USER_ID", USER_ID);
	    
		paramMap.put("USER_ID", USER_ID);
		Map<String, Object> userInfo = pelsExamService.getDetail("GetUserInfo", paramMap);
		logField("Exam_Input_M [DB]", "userInfo", userInfo);
		if (userInfo != null) {
			HttpSession session = request.getSession();
			session.setAttribute("LOGIN_USER_ID", userInfo.get("USER_ID"));
			session.setAttribute("LOGIN_USER_NM", userInfo.get("USER_NAME"));
			session.setAttribute("LOGIN_USER_DEPT_CD", userInfo.get("DEPT_CD"));
			session.setAttribute("LOGIN_USER_DEPT_NM", userInfo.get("DEPT_NM"));
			session.setAttribute("LOGIN_USER_JIKWI", userInfo.get("JIKWI"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE", userInfo.get("TYPE_CD"));
			session.setAttribute("LOGIN_USER_PLANT_TYPE_NM", userInfo.get("TYPE_DESC"));
			session.setAttribute("LOGIN_USER_PLANT_CD", userInfo.get("PLANT"));
			session.setAttribute("LOGIN_USER_PLANT_NM", userInfo.get("PLANT_DESC"));
			session.setAttribute("LOGIN_USER_UNIT_TYPE", userInfo.get("UNIT_TYPE"));
			session.setAttribute("LOGIN_USER_JIKJE1", userInfo.get("JIKJE1"));
			session.setAttribute("LOGIN_USER_JIKJE2", userInfo.get("JIKJE2"));
			session.setAttribute("LOGIN_USER_JIKJE3", userInfo.get("JIKJE3"));
			session.setAttribute("LOGIN_USER_JIKJE4", userInfo.get("JIKJE4"));
			session.setAttribute("LOGIN_USER_JIKJE5", userInfo.get("JIKJE5"));
			session.setAttribute("LOGIN_USER_JJTXT1", userInfo.get("JJTXT1"));
			session.setAttribute("LOGIN_USER_JJTXT2", userInfo.get("JJTXT2"));
			session.setAttribute("LOGIN_USER_JJTXT3", userInfo.get("JJTXT3"));
			session.setAttribute("LOGIN_USER_JJTXT4", userInfo.get("JJTXT4"));
			session.setAttribute("LOGIN_USER_JJTXT5", userInfo.get("JJTXT5"));
			String LOGIN_USER_JIKJE = "";
			if (!StringUtil.isNull((String) userInfo.get("JIKJE1"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE1");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE2"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE2");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE3"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE3");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE4"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE4");
			if (!StringUtil.isNull((String) userInfo.get("JIKJE5"))) LOGIN_USER_JIKJE = (String) userInfo.get("JIKJE5");
			session.setAttribute("LOGIN_USER_JIKJE", LOGIN_USER_JIKJE);
			session.setAttribute("LOGIN_USER_CEL_TEL", userInfo.get("CEL_TEL"));
			
			session.setMaxInactiveInterval(60*60*100);
		}
		else {
			log.warn("[PELSExamMobile] Exam_Input_M | user not found for USER_ID={}", USER_ID);
		}
		
		// 초기세팅 등록자는 세션에서 가져와서 이름 세팅해야할 것...
		// 세션에서 유저정보 조회....
		HttpSession session = request.getSession();
		String CHKPR_ID = (String) session.getAttribute("LOGIN_USER_ID");
		String CHKPR_FNM = (String) session.getAttribute("LOGIN_USER_NM");
		
		paramMap.put("LAST_UPDR_ID", CHKPR_ID);
		paramMap.put("PRCDOC_NO", "");
		paramMap.put("PRCDOC_NM", "");
		
		ArrayList PrcdocList = (ArrayList) pelsExamService.getList("ProcedureList", paramMap);
		mav.addObject("PrcdocList", PrcdocList);

		if("".equals(SH_DOC_TYP_CD))
			SH_DOC_TYP_CD = "FP0";
		
		mav.addObject("SH_DOC_TYP_CD", SH_DOC_TYP_CD);
		mav.addObject("SH_PRCDOC_NO", SH_PRCDOC_NO);
		mav.addObject("SH_PRT_NO", SH_PRT_NO);
		mav.addObject("USER_ID", USER_ID);
		
		mav.setViewName("/pels/exam/Exam_Input_M");
		logSessionAttributes(request, "Exam_Input_M");
		log.info("[PELSExamMobile] <<< Exam_Input_M | view={} | SH_DOC_TYP_CD={}", mav.getViewName(), SH_DOC_TYP_CD);
		return mav;
	}

	// -------------------------------------------------------------------------
	// 로깅 헬퍼 (외부 클라이언트 디버깅용)
	// -------------------------------------------------------------------------

	/**
	 * 외부 클라이언트 호출 시 요청 메타·파라미터·(선택) 세션을 전면 로깅
	 */
	private void logIncomingRequest(HttpServletRequest request, String endpointName) {
		log.info(
				"[PELSExamMobile] >>> {} | {} {} | remote={} | query={}",
				endpointName,
				request.getMethod(),
				request.getRequestURI(),
				request.getRemoteAddr(),
				formatLogValue(request.getQueryString()));

		Enumeration<String> headerNames = request.getHeaderNames();
		if (headerNames == null) {
			log.warn("[PELSExamMobile] {} | headers={}", endpointName, LOG_NULL_MARKER);
		} else {
			while (headerNames.hasMoreElements()) {
				String name = headerNames.nextElement();
				logField(endpointName, "header[" + name + "]", request.getHeader(name));
			}
		}

		Map<String, String[]> paramMap = request.getParameterMap();
		if (paramMap == null) {
			log.warn("[PELSExamMobile] {} | parameterMap={}", endpointName, LOG_NULL_MARKER);
		} else if (paramMap.isEmpty()) {
			log.info("[PELSExamMobile] {} | parameters: (none)", endpointName);
		} else {
			for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
				String key = entry.getKey();
				String[] values = entry.getValue();
				if (values == null) {
					logParamValue(endpointName, key, null);
				} else if (values.length == 1) {
					logParamValue(endpointName, key, values[0]);
				} else {
					for (int i = 0; i < values.length; i++) {
						logParamValue(endpointName, key + "[" + i + "]", values[i]);
					}
				}
			}
		}
	}

	private void logSessionAttributes(HttpServletRequest request, String endpointName) {
		HttpSession session = request.getSession(false);
		if (session == null) {
			log.warn("[PELSExamMobile] {} | session={}", endpointName, LOG_NULL_MARKER);
			return;
		}
		log.info(
				"[PELSExamMobile] {} | sessionId={} | maxInactiveInterval={}",
				endpointName,
				session.getId(),
				session.getMaxInactiveInterval());
		Enumeration<String> names = session.getAttributeNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			logField(endpointName, "session[" + name + "]", session.getAttribute(name));
		}
	}

	/** 요청/응답 필드 1건 — null·empty는 WARN + 마커로 즉시 구분 */
	private void logField(String endpointName, String fieldName, Object value) {
		if (value == null) {
			log.warn("[PELSExamMobile] {} | {}={}", endpointName, fieldName, LOG_NULL_MARKER);
			return;
		}
		if (value instanceof String) {
			logParamValue(endpointName, fieldName, (String) value);
			return;
		}
		log.info(
				"[PELSExamMobile] {} | {}={}",
				endpointName,
				fieldName,
				truncateForLog(String.valueOf(value)));
	}

	private void logMapFields(String endpointName, String phase, Map<String, ?> map) {
		if (map == null) {
			log.warn("[PELSExamMobile] {} | {} map={}", endpointName, phase, LOG_NULL_MARKER);
			return;
		}
		for (Map.Entry<String, ?> entry : map.entrySet()) {
			logField(endpointName + " | " + phase, entry.getKey(), entry.getValue());
		}
	}

	private void logParamValue(String endpointName, String paramName, String value) {
		if (value == null) {
			log.warn("[PELSExamMobile] {} | {}={}", endpointName, paramName, LOG_NULL_MARKER);
		} else if (value.isEmpty()) {
			log.warn("[PELSExamMobile] {} | {}={}", endpointName, paramName, LOG_EMPTY_MARKER);
		} else {
			log.info(
					"[PELSExamMobile] {} | {}={}",
					endpointName,
					paramName,
					truncateForLog(value));
		}
	}

	private static String formatLogValue(String value) {
		if (value == null) {
			return LOG_NULL_MARKER;
		}
		if (value.isEmpty()) {
			return LOG_EMPTY_MARKER;
		}
		return truncateBody(value);
	}

	private static String truncateForLog(String value) {
		return formatLogValue(value);
	}

	private static String truncateBody(String value) {
		if (value.length() <= LOG_PARAM_MAX_LEN) {
			return value;
		}
		return value.substring(0, LOG_PARAM_MAX_LEN)
				+ "...[truncated, totalLen="
				+ value.length()
				+ "]";
	}
}
