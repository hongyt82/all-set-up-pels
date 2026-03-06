package common.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.Blob;
import java.sql.SQLException;

import javax.sql.rowset.serial.SerialBlob;
import javax.sql.rowset.serial.SerialException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Base64Utils;
import java.io.FileNotFoundException;

public class PELS_FileUtil {
	private static final Logger log = LoggerFactory.getLogger(PELS_FileUtil.class);
	
	@SuppressWarnings("finally")
	private static Blob convertFileToBlob(File file) throws IOException {
		Blob blob = null;
		
		FileInputStream fis = null;
		
		byte[] byteArray = new byte[(int) file.length()];
		try {
			fis = new FileInputStream(file);
			fis.read(byteArray);
			blob = new SerialBlob(byteArray);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			log.debug("IOException occured");
		} catch (SerialException e) {
			// TODO Auto-generated catch block
			log.debug("SerialException occured");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			log.debug("SQLException occured");
		} finally {
			fis.close();
		}
		
		return blob;
	}
	
	public void convertBlobToFile(byte[] bytearray, String fileName, String path) {
		FileOutputStream fos = null;
		try {
			path = path+File.separator+fileName.toLowerCase();
			fos = new FileOutputStream(path);
			fos.write(bytearray);
			fos.flush();
			// createThumbnail(path, fileName, 750, new ByteArrayInputStream(bytearray));
		} catch (IOException e) {
			log.debug("IOException occured !!! Method :: WMSS_FileUtil > convertBlobToFile");
		} finally {
			if(fos != null) try { fos.close(); } catch (IOException e) {};
		}
	}
	
	public static byte[] convertBlobToByte (Blob blob) throws IOException {
		byte[] bytes = null;
		BufferedInputStream is = null;
		
		try {
			is = new BufferedInputStream(blob.getBinaryStream());
			bytes = new byte[(int) blob.length()];
			
			int len = bytes.length;
			int offset = 0;
			int read = 0;
			
			while (offset < len && (read = is.read(bytes, offset, len - offset)) >= 0) {
				offset += read;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			log.debug("SQLException occured.");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			log.debug("IOException occured.");
		} finally {
			is.close();
		}
		
		return bytes;
	}
	
	public static String byteToBase64 (byte[] arr) {
		String result = "";
		result = Base64Utils.encodeToString(arr);
		
		return result;
	}
	
	public static boolean FileCopy(String oriFile, String copyFile) {
		FileInputStream fis = null;
		FileOutputStream fos = null;
		
		try {
			
			File deleteFile = new File(copyFile);
			if(deleteFile.exists()) {
				deleteFile.delete();
			}
			
			fis = new FileInputStream(oriFile);
			fos = new FileOutputStream(copyFile);
			
			int fileByte = 0;
			while((fileByte = fis.read()) != -1) {
				fos.write(fileByte);
			}
		} 
		catch(FileNotFoundException e) {
			e.printStackTrace();
			return false;
		}
		catch(IOException e) {
			e.printStackTrace();
			return false;
		} finally {
			if(fis != null) try { fis.close(); } catch (IOException e) {};
			if(fos != null) try { fos.close(); } catch (IOException e) {};
		}
		
		return true;
	}	
}
