package com.khnp.pels.exam.dto;

import java.util.List;
import com.khnp.pels.exam.dto.PdfInfo;
import com.khnp.pels.exam.dto.PdfJson;

public class PdfPage {
	private int page;
    private int pdfPageNo;
    private int width;
    private int height;
    private String isChange;
    private List<Object> components;
    
	public PdfPage() {
	}

	// ✅ 전체 필드 생성자
    public PdfPage(int page, int pdfPageNo, int width, int height,
                   String isChange, List<Object> components) {
        this.page = page;
        this.pdfPageNo = pdfPageNo;
        this.width = width;
        this.height = height;
        this.isChange = isChange;
        this.components = components;
    }

    // ✅ getter 필수 (JSON 직렬화용)
    public int getPage() { return page; }
    public int getPdfPageNo() { return pdfPageNo; }
    public int getWidth() { return width; }
    public int getHeight() { return height; }
    public String getIsChange() { return isChange; }
    public List<Object> getComponents() { return components; }
}
