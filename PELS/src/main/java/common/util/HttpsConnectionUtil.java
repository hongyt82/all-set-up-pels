/*************************************************************
	프로그램명 : HttpConnectionUtil.java
	설      명 : 유틸
	작  성  자 : 한철수
	소      속 : FOCUSTEK
	일      자 : 2021.01.10
	수  정  일 : 
*************************************************************/
package common.util;

import java.io.*;
import java.net.*;
import java.security.MessageDigest;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.TimeZone;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;

import org.apache.commons.lang.StringUtils;

public class HttpsConnectionUtil {
	
	/**
	 * Content Path
	 * 
	 * @return
	 */
	public static String postRequest(String pURL, HashMap <String, String> pList) {
		String myResult = "";
		
		try {
			String param = "";
			if(pList != null) {
				Set key = pList.keySet();
				
				for(Iterator iterator = key.iterator(); iterator.hasNext();) {
					String keyName = (String) iterator.next();
					String valueName = pList.get(keyName);
					if("".equals(param)) param += "?"; else param += "&";
					param += keyName + "=" + URLEncoder.encode(valueName, "utf-8");
				}
			}

			URL url = new URL(pURL+param);
			
			HttpsURLConnection http = (HttpsURLConnection) url.openConnection();
			
			http.setDefaultUseCaches(false);
			http.setDoInput(true);
			http.setDoOutput(true);
			http.setRequestMethod("POST");
			
			StringBuffer buffer = new StringBuffer();
			
			OutputStreamWriter outStream = new OutputStreamWriter(http.getOutputStream(), "UTF-8");
			PrintWriter writer = new PrintWriter(outStream);
			writer.write(buffer.toString());
			writer.flush();
			
			InputStreamReader tmp = new InputStreamReader(http.getInputStream(), "UTF-8");
			BufferedReader reader = new BufferedReader(tmp);
			StringBuilder builder = new StringBuilder();
			String str;
			while((str = reader.readLine()) != null) {
				builder.append(str + "\n");
			}
			myResult = builder.toString();
		}
		catch (MalformedURLException e) {
			e.printStackTrace();
		}
		catch(IOException e) {
			e.printStackTrace();
		}
		
		return myResult;
	}
}
