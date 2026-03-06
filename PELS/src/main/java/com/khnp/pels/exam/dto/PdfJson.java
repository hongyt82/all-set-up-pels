package com.khnp.pels.exam.dto;

import java.util.List;

public class PdfJson {
    private String creationDate;
    private String user;
    private String department;
    private PdfInfo pdfInfo;
    private List<PdfPage> pages;

    public PdfJson() {}

    public PdfJson(String creationDate, String user, String department,
                   PdfInfo pdfInfo, List<PdfPage> pages) {
        this.creationDate = creationDate;
        this.user = user;
        this.department = department;
        this.pdfInfo = pdfInfo;
        this.pages = pages;
    }

    // ✅ getter 반드시 필요
    public String getCreationDate() { return creationDate; }
    public String getUser() { return user; }
    public String getDepartment() { return department; }
    public PdfInfo getPdfInfo() { return pdfInfo; }
    public List<PdfPage> getPages() { return pages; }
}
