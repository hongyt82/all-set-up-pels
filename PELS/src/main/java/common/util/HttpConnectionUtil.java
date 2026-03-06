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

import java.net.HttpURLConnection;
import java.net.MalformedURLException;

import org.apache.commons.lang.StringUtils;

public class HttpConnectionUtil {
	
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
					if("".equals(param)) param += ""; else param += "&";
					param += keyName + "=" + URLEncoder.encode(valueName, "utf-8");
				}
			}
			
			byte[] postDataBytes = param.getBytes("UTF-8");

			URL url = new URL(pURL);
			
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			http.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
			http.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));
			http.setDefaultUseCaches(false);
			http.setDoInput(true);
			http.setDoOutput(true);
			http.setRequestMethod("POST");
			
			http.getOutputStream().write(postDataBytes);
			
			StringBuffer buffer = new StringBuffer();
			
			/*
			OutputStreamWriter outStream = new OutputStreamWriter(http.getOutputStream(), "UTF-8");
			PrintWriter writer = new PrintWriter(outStream);
			writer.write(buffer.toString());
			writer.flush();
			*/
			
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
	
	/**
	 * Content Path
	 * 
	 * @return
	 */
	public static String postRequest2(String pURL, HashMap <String, String> pList) {
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
			
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			
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

	/**
	 * Content Path
	 * 
	 * @return
	 */
	public static String postRequestJson(String pURL, HashMap <String, String> pList) {
		String myResult = "";
		
		try {
			String param = "";
			if(pList != null) {
				Set key = pList.keySet();
				
				param = "{";
				int i = 0;
				for(Iterator iterator = key.iterator(); iterator.hasNext();) {
					String keyName = (String) iterator.next();
					String valueName = pList.get(keyName);
					if(i > 0) param += ",";
					param += "\"" + keyName + "\":\"" + URLEncoder.encode(valueName, "UTF-8") + "\"";
					i++;
				}
				param += "}";
			}

			URL url = new URL(pURL);
			
			System.out.println(url);
			System.out.println(param);
			
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			
			http.setRequestProperty("Content-Type", "application/json");
			http.setDefaultUseCaches(false);
			http.setDoInput(true);
			http.setDoOutput(true);
			http.setRequestMethod("POST");
			
			StringBuffer buffer = new StringBuffer();
			
			try(OutputStream os = http.getOutputStream() ) {
				byte[] input = param.getBytes("UTF-8");
				os.write(input, 0, input.length);
			}
			//PrintWriter writer = new PrintWriter(outStream);
			//writer.write(buffer.toString());
			//iter.flush();
			
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

	/**
	 * Content Path
	 * 
	 * @return
	 */
	/*
	public static String postRequestJson(String pURL, HashMap <String, String> pList) {
		String myResult = "";
		
		try {
			String param = "";
			if(pList != null) {
				Set key = pList.keySet();
				
				param = "{\"importParameter\":{";
				int i = 0;
				for(Iterator iterator = key.iterator(); iterator.hasNext();) {
					String keyName = (String) iterator.next();
					String valueName = pList.get(keyName);
					if(i > 0) param += ",";
					param += "\"" + keyName + "\":\"" + URLEncoder.encode(valueName, "UTF-8") + "\"";
					i++;
				}
				param += "}}";
			}

			URL url = new URL(pURL);
			
			System.out.println(url);
			System.out.println(param);
			
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			
			http.setRequestProperty("Content-Type", "application/json");
			http.setDefaultUseCaches(false);
			http.setDoInput(true);
			http.setDoOutput(true);
			http.setRequestMethod("POST");
			
			StringBuffer buffer = new StringBuffer();
			
			try(OutputStream os = http.getOutputStream() ) {
				byte[] input = param.getBytes("UTF-8");
				os.write(input, 0, input.length);
			}
			//PrintWriter writer = new PrintWriter(outStream);
			//writer.write(buffer.toString());
			//iter.flush();
			
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
	*/
	
	/**
	 * Content Path
	 * 
	 * @return
	 */
	public static String apimRequest(String pURL, HashMap <String, String> pList) {
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
			
			System.out.println(url);
			
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			
			http.setRequestProperty("Content-Type", "application/json");
			http.setRequestProperty("apiKey", "1b8958dc-5426-492e-89c1-fbc0ff5963fa");
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
	
	/**
	 * Content Path
	 * 
	 * @return
	 */
	public static String apimRequestPost(String pURL, HashMap <String, String> pList) {
		String myResult = "";
		
		try {
			String param = "";
			if(pList != null) {
				Set key = pList.keySet();
				
				param = "{\"importParameter\":{";
				int i = 0;
				for(Iterator iterator = key.iterator(); iterator.hasNext();) {
					String keyName = (String) iterator.next();
					String valueName = pList.get(keyName);
					if(i > 0) param += ",";
					param += "\"" + keyName + "\":\"" + URLEncoder.encode(valueName, "UTF-8") + "\"";
					i++;
				}
				param += "}}";
			}

			URL url = new URL(pURL);
			
			System.out.println(url);
			System.out.println(param);
			
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			
			http.setRequestProperty("Content-Type", "application/json");
			http.setRequestProperty("apiKey", "1b8958dc-5426-492e-89c1-fbc0ff5963fa");
			http.setDefaultUseCaches(false);
			http.setDoInput(true);
			http.setDoOutput(true);
			http.setRequestMethod("POST");
			
			StringBuffer buffer = new StringBuffer();
			
			try(OutputStream os = http.getOutputStream() ) {
				byte[] input = param.getBytes("UTF-8");
				os.write(input, 0, input.length);
			}
			//PrintWriter writer = new PrintWriter(outStream);
			//writer.write(buffer.toString());
			//iter.flush();
			
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
