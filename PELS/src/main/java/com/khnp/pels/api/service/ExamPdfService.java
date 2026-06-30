package com.khnp.pels.api.service;

public interface ExamPdfService {

	byte[] generateExamPdf(
			String pdfPath,
			String overlayJson
	) throws Exception;

}