package common.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;

import org.apache.poi.hssf.util.CellRangeAddress;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ExcelObject {
	private static final Logger log = LoggerFactory.getLogger(ExcelObject.class);
	private static String _filePath = "init";
	private static int sheetNum = 1;
	
	public static int getsheetNum (){
		sheetNum++;
		return sheetNum;
	}
	
	public static Map getExcelObject (String filePath) {
		Map map = null;
		try {
			sheetNum = 1;
			 map = new HashMap();
			 _filePath = filePath;
			 XSSFWorkbook xssfWorkbook = new XSSFWorkbook();
			 XSSFSheet sheet = xssfWorkbook.createSheet("sheet"+sheetNum);
			 sheet.addMergedRegion(CellRangeAddress.valueOf("A1:A2"));

			 XSSFFont font = xssfWorkbook.createFont();
			 font.setBoldweight((short) 700);                                    
			 sheet.setDefaultColumnWidth(20);
			 XSSFCellStyle headerStyle = xssfWorkbook.createCellStyle();
			 XSSFCellStyle dataStyle = xssfWorkbook.createCellStyle();
			 headerStyle.setFillForegroundColor(HSSFColor.WHITE.index);                                    
			 headerStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);         
			 headerStyle.setFont(font);
			 headerStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
			 headerStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
			 headerStyle.setBorderTop(BorderStyle.THIN);
			 headerStyle.setBorderRight(BorderStyle.THIN);
			 headerStyle.setBorderLeft(BorderStyle.THIN);
			 headerStyle.setBorderBottom(BorderStyle.THIN);
			 headerStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);
			 headerStyle.setWrapText(true);
			 dataStyle.setWrapText(true);
			 FileOutputStream fos = null;
			 try {
				 fos = new FileOutputStream(filePath);
				 map.put("XSSFWorkbook",xssfWorkbook);
				 map.put("XSSFSheet", sheet);
				 map.put("XSSFFont", font);
				 map.put("headerStyle", headerStyle);
				 map.put("dataStyle", dataStyle);
				 map.put("FileOutputStream", fos);
			 } catch (IOException e) {
			 }
			 finally {
				 if(fos != null) try { fos.close(); } catch (IOException e) {};
			 }
			 return map;
			 
		} catch (Exception e) {
			// e.printStackTrace();
			log.debug("Error occured !!! Method :: ExcelObject > getExcelObject");
		}
		
		return null;
	}
	
	public static Map getExcelObject (String filePath,List mergeList) {
		Map map = null;
		try {
			sheetNum = 1;
			 map = new HashMap();
			 _filePath = filePath;
			 XSSFWorkbook xssfWorkbook = new XSSFWorkbook();
			 XSSFSheet sheet = xssfWorkbook.createSheet("sheet"+sheetNum);
			 if(mergeList!=null && mergeList.size()>0){
				 for(int i=0; i<mergeList.size(); i++){
					 sheet.addMergedRegion(CellRangeAddress.valueOf(mergeList.get(i)+""));
				 }
			 }			 

			 XSSFFont font = xssfWorkbook.createFont();
			 font.setBoldweight((short) 700);                                    
			 sheet.setDefaultColumnWidth(20);
			 XSSFCellStyle headerStyle = xssfWorkbook.createCellStyle();
			 XSSFCellStyle dataStyle = xssfWorkbook.createCellStyle();
			 headerStyle.setFillForegroundColor(HSSFColor.WHITE.index);                                    
			 headerStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);         
			 headerStyle.setFont(font);
			 headerStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
			 headerStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
			 headerStyle.setBorderTop(BorderStyle.THIN);
			 headerStyle.setBorderRight(BorderStyle.THIN);
			 headerStyle.setBorderLeft(BorderStyle.THIN);
			 headerStyle.setBorderBottom(BorderStyle.THIN);
			 headerStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);
			 headerStyle.setWrapText(true);
			 dataStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
			 dataStyle.setBorderTop(BorderStyle.THIN);
			 dataStyle.setBorderRight(BorderStyle.THIN);
			 dataStyle.setBorderLeft(BorderStyle.THIN);
			 dataStyle.setBorderBottom(BorderStyle.THIN);
			 
			 FileOutputStream fos = null;
			 try {
				 fos = new FileOutputStream(filePath);
				 map.put("XSSFWorkbook",xssfWorkbook);
				 map.put("XSSFSheet", sheet);
				 map.put("XSSFFont", font);
				 map.put("headerStyle", headerStyle);
				 map.put("dataStyle", dataStyle);
				 map.put("FileOutputStream", fos);
			 } catch (IOException e) {
			 }
			 finally {
				 if(fos != null) try { fos.close(); } catch (IOException e) {};
			 }

			 return map;
		} catch (Exception e) {
			//e.printStackTrace();
			log.debug("Error occured !!! Method :: ExcelObject > getExcelObject");
		}
		
		return null;
	}
	
	public static boolean isExistsFile (String fil) {
		File f = new File (fil);
		if (f.exists())
			return true;
		return false;
	}
}
