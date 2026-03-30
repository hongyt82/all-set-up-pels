package com.khnp.pels.exam.dto;

public class PdfInfo {
    private int totalPages;
    private long canvasWidth;
    private long canvasHeight;

    public PdfInfo() {}

    public PdfInfo(int totalPages, long canvasWidth, long canvasHeight) {
        this.totalPages = totalPages;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    // ✅ 반드시 필요
    public int getTotalPages() {
        return totalPages;
    }

    public float getCanvasWidth() {
        return canvasWidth;
    }

    public float getCanvasHeight() {
        return canvasHeight;
    }
}
