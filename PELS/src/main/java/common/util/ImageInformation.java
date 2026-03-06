package common.util;

import java.io.File;
import java.io.IOException;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.MetadataException;
import com.drew.metadata.Tag;

public class ImageInformation {
	
	public ImageInformation() {
		
	}
	
	public static String getImageMetaInfo(File file, String tagName)  throws IOException, MetadataException, ImageProcessingException {
		String retVal = "";
		
		Metadata metadata = ImageMetadataReader.readMetadata(file);
		
		
	    for (Directory directory : metadata.getDirectories()) {
	        for (Tag tag : directory.getTags()) {
	        	if(tagName.equals(tag.getTagName())){
	        		retVal = tag.getDescription();
	        	}
	        }
	        
	    }
		return retVal;
	}
}
