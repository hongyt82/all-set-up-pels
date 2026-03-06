package common.util;

import org.springframework.util.StringUtils;

public class StringUtil {
	public static String nvl (String param, String sub) {
		return param == null || StringUtils.trimAllWhitespace(param).equals("") ? sub : param;
	}
	
	public static boolean isNull (String str) {
		return (str == null || str.equals("") || str == "undefined"); 
	}
}
