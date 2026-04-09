package com.khnp.pels.common.util;

import java.util.Properties;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import common.util.StringUtil;

/**
 * e-link-v2 iframe base URL 처리하는 부분에 대한 사항 util 성으로 정리한다.
 * 로컬상에서 Front End Vite 서버 기동 Not Found 처리 이외에 사항은 그대로 getContextPath
 *
 * Local(loopback) request only:
 * - VM option {@code -DPELS_ELINK_V2_BASE_URL=...} first
 * - then {@code utilProperties.getProperty("PELS_ELINK_V2_BASE_URL")}
 * - then fallback to {@code http://localhost:4008}
 *
 * Non-loopback request:
 * - loopback 아니면 getContextPath 의 사항 리턴
 * - always uses {@code request.getContextPath()}
 *
 * 현재의 사항과 연관된 JSP
 * - webapp/WEB-INF/jsp/pels/Exam_KhnpReplayViewer.jsp
 * - webapp/WEB-INF/jsp/pels/Exam_KhnpViewer.jsp
 * - webapp/WEB-INF/jsp/pels/Exam_KhnpEditor.jsp
 * - webapp/WEB-INF/jsp/pels/Exam_KhnpViewer.jsp
 * {@code
 *   String elinkRoot = (String) request.getAttribute("ELINK_V2_ROOT");
 * 	    if (elinkRoot == null) {
 * 		    elinkRoot = request.getContextPath();
 * 	        }
 * 	}
 *
 * 	- 현재의 사항을 사용하고자 아니하면 각 부분 Controller 내에 사용 주석
 * 	- 각 .jsp 그냥 request.getContextPath() 로 선언
 */
public final class ElinkV2RootUtil {

    public static final String MODEL_KEY = "ELINK_V2_ROOT";

	private static final String BASE_URL_KEY = "PELS_ELINK_V2_BASE_URL";

	private static final String LOCAL_DEFAULT_ORIGIN = "http://localhost:4008";

    /**
     * Controller 쪽에 선언하여 사용하는 메인 실행부
     * @param request HttpServletRequest
     * @param mav ModelAndView
     * @param utilProperties resources/props/util.properties
     */
	public static void addToModel(HttpServletRequest request, ModelAndView mav, Properties utilProperties) {
		mav.addObject(MODEL_KEY, resolve(request, utilProperties));
	}

    /**
     * Loopback 사항을 기준으로 하며 없다면 getContextPath WAR URL 서비스내 상위 호스트 전달받아 처리
     * VMOption local 기재하여 사용하면 해당 타겟으로 설정을 돌려 주게 되어있는데 현재의 구성된 서비스상 문제가 있어
     * 옵션으로 남겨놓고 Loopback host 를 기준으로 자동 처리되어지게 구성함.
     * @param request HttpServletRequest
     * @param utilProperties resources/props/util.properties
     * @return 최종 처리된 상위 호스트
     */
	public static String resolve(HttpServletRequest request, Properties utilProperties) {
		String host = request.getServerName();
		if (!isLoopbackHost(host)) {
			return request.getContextPath();
		}

		String configured = configuredBaseUrl(utilProperties);
		if (configured.isEmpty()) {
			configured = LOCAL_DEFAULT_ORIGIN;
		}
		return trimTrailingSlashes(configured);
	}

	private static String configuredBaseUrl(Properties utilProperties) {
		String fromVm = System.getProperty(BASE_URL_KEY);
		if (fromVm != null) {
			return fromVm.trim();
		}
		if (utilProperties == null) {
			return "";
		}
		return StringUtil.nvl(utilProperties.getProperty(BASE_URL_KEY), "").trim();
	}

    /**
     * Local host 의 기준
     * @param host 127.0.0.1 , localhost
     * @return local host return
     */
	private static boolean isLoopbackHost(String host) {
		return "127.0.0.1".equals(host) || "localhost".equalsIgnoreCase(host);
	}

    /**
     * Trim WhiteSpace 처리
     * @param
     * @return 처리된 문자 일체
     */
	private static String trimTrailingSlashes(String s) {
		String t = StringUtil.nvl(s, "");
		while (t.endsWith("/")) {
			t = t.substring(0, t.length() - 1);
		}
		return t;
	}
}

