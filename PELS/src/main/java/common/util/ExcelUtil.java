package common.util;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFPalette;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component("excelUtil")
public class ExcelUtil {
	private static final Logger log = LoggerFactory.getLogger(ExcelUtil.class);
	private int mStartRow = 0;
    private int mStartCol = 0;
    private int mWidth = 5000;
    private List<Integer> mArrWidth;

    private IndexedColors mHeaderColor =  IndexedColors.SEA_GREEN;
    private IndexedColors mDataColor =  IndexedColors.WHITE;

    private XSSFWorkbook mWorkbook;

    private String mSheetName = "sheet1";

    private List<Object> mHeader;
    private List<List<Object>> mData;
    
    private InputStream mReadFile;
	
    public ExcelUtil(List<Object> header, List<List<Object>> data) {
        mHeader = header;
        mData = data;
    }
    
    public ExcelUtil() {

    }
    
    public ExcelUtil(InputStream excelFile) {
    	mReadFile = excelFile;
    }
    
    public void setStartCol(int startCol) {
        mStartCol = startCol;
    }

    public void setSheetName(String sheetName) {
        mSheetName = sheetName;
    }

    public void setWidth(int width) {
        mWidth = width;
    }
    
    public void setmArrWidth(List<Integer> mArrWidth) {
		this.mArrWidth = mArrWidth;
	}

	public void setHeaderColor(IndexedColors headerColor) {
        mHeaderColor = headerColor;
    }

    public void setDataColor(IndexedColors dataColor) {
        mDataColor = dataColor;
    }  
    
    public byte[] makeExcel() {
        mWorkbook = new XSSFWorkbook();
        XSSFSheet sheet = mWorkbook.createSheet(mSheetName);
        XSSFRow headerRow = sheet.createRow(mStartRow);

        int headerCount = mHeader.size();

        for (int i=mStartCol; i<headerCount+mStartCol; i++) {
            XSSFCell headerCell = headerRow.createCell(i, XSSFCell.CELL_TYPE_STRING);
            
            setCell(headerCell, String.valueOf(mHeader.get(i - mStartCol)), (short)100);
            
           	sheet.setColumnWidth(i - mStartCol, mArrWidth.get(i - mStartCol));
            headerRow.setHeight((short)750);
            
        }

        int dataCount = mData.size();

        for (int i=mStartRow+1; i<dataCount+mStartRow+1; i++) {
            XSSFRow dataRow = sheet.createRow(i);

            List<Object> data = mData.get(i - (mStartRow + 1));

            int count = data.size();

            for (int j=mStartCol; j<count+mStartCol; j++) {
                XSSFCell dataCell = dataRow.createCell(j, XSSFCell.CELL_TYPE_STRING);

                Object cell = data.get(j - mStartCol);
                if("-".equals(cell))
                	cell = "";
                
                
                String cellStr;

                if (cell instanceof Date) {
                    cellStr = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss",Locale.US).format(cell);
                } else {
                    cellStr = String.valueOf(cell);
                }

                setCell(dataCell, cellStr, mDataColor.getIndex());
                
               	//sheet.setColumnWidth(j - mStartCol, mArrWidth.get(j - mStartCol));
            }
        }

        byte[] bytes = new byte[0];

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            mWorkbook.write(out);
            bytes = out.toByteArray();
        } catch (IOException e) {
            // e.printStackTrace();
        	log.debug("IOException occured !!! Method :: ExcelUtil > makeExcel");
        } finally {
        	try {
				out.close();
			} catch (IOException e) {
				log.debug("IOException occured !!! Method :: ExcelUtil > makeExcel");
			}
        }

        return bytes;
    }
    
    public List<List<Object>> readExcel(){
    	List<List<Object>> excelData = new ArrayList<List<Object>>();
    	List<Object> cellData = null;
    	
        try {
			mWorkbook = new XSSFWorkbook(mReadFile);
			XSSFSheet sheet    =  null;
			XSSFRow row     =  null;
			XSSFCell cell    =  null;
			
			FormulaEvaluator evaluator = mWorkbook.getCreationHelper().createFormulaEvaluator();
			String data = "";
			
			int sheetNum =  mWorkbook.getNumberOfSheets();
			for(int i=0;i<sheetNum;i++){//시트가 여러개 있을 경우
			    sheet = mWorkbook.getSheetAt(i);
			    
			    int lastRowNum = sheet.getLastRowNum();
			    for(int r=sheet.getFirstRowNum();r<=lastRowNum;r++){//row를 읽는다.
			    	row = sheet.getRow(r);
			        if(row== null) continue;
			        
		    		int lastCellNum = row.getLastCellNum();
			        cellData = new ArrayList<Object>();
			        for(int c=row.getFirstCellNum();c<=lastCellNum;c++){//cell을 읽는다.
				        cell   =  row.getCell(c);
				        //if(cell== null) continue;
				        if(cell== null) {cellData.add(""); continue;}
				        
				        switch(cell.getCellType()){
					        case XSSFCell.CELL_TYPE_NUMERIC:
//					        	cellData.add(cell.getNumericCellValue());
					        	cellData.add(new BigDecimal(cell.getNumericCellValue()).toPlainString());
					        	break;
					        case XSSFCell.CELL_TYPE_STRING:
					        	cellData.add(cell.getStringCellValue());
					        	break;
					        case XSSFCell.CELL_TYPE_FORMULA :
					        	//cellData.add(cell.getCellFormula());
					        	if(!(cell.toString().equalsIgnoreCase("")) ){
					        		if(evaluator.evaluateFormulaCell(cell)==HSSFCell.CELL_TYPE_NUMERIC){
					        			double fddata = cell.getNumericCellValue();
					        			DecimalFormat df = new DecimalFormat();
					        			data = df.format(fddata);
					        		}else if(evaluator.evaluateFormulaCell(cell)==HSSFCell.CELL_TYPE_STRING){
					        			data = cell.getStringCellValue();
					        		}else if(evaluator.evaluateFormulaCell(cell)==HSSFCell.CELL_TYPE_BOOLEAN){
					        			boolean fbdata = cell.getBooleanCellValue();         
					        			data = String.valueOf(fbdata);         
					        		}
					        		cellData.add(data);
					        	}
					        	break;
					        default:
					        	cellData.add("");
				       }
			        }
				    excelData.add(cellData);
			    }
				
			}
		} catch (FileNotFoundException e) {
			//e.printStackTrace();
			log.debug("FileNotFoundException occured !!! Method :: ExcelUtil > makeExcel");
		} catch (IOException e) {
			// e.printStackTrace();
			log.debug("IOException occured !!! Method :: ExcelUtil > makeExcel");
		}

		return excelData;
    }

    private void setCell(XSSFCell headerCell, String data, int index) {
        headerCell.setCellValue(data);

        XSSFCellStyle cellStyle = mWorkbook.createCellStyle();

        cellStyle.setBorderBottom(XSSFCellStyle.BORDER_THIN);
        cellStyle.setBottomBorderColor(IndexedColors.BLACK.getIndex());

        cellStyle.setBorderLeft(XSSFCellStyle.BORDER_THIN);
        cellStyle.setLeftBorderColor(IndexedColors.BLACK.getIndex());

        cellStyle.setBorderRight(XSSFCellStyle.BORDER_THIN);
        cellStyle.setRightBorderColor(IndexedColors.BLACK.getIndex());

        cellStyle.setBorderTop(XSSFCellStyle.BORDER_THIN);
        cellStyle.setTopBorderColor(IndexedColors.BLACK.getIndex());

        cellStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);
        if(index == 100) {
        	cellStyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(196, 215, 155)));
        } else {
        	cellStyle.setFillForegroundColor((short)index);
        }

        cellStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
        
        cellStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);

        cellStyle.setWrapText(true);
        
        headerCell.setCellStyle(cellStyle);
    }
    
}
