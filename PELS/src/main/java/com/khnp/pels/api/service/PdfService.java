package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventResponse;

import java.util.List;

/**
 * 이벤트 PDF 서비스 인터페이스
 * @author KwangYong
 * @since 2006-05-19
 */
public interface PdfService {

	/**
	 * 이벤트 목록 PDF 생성
	 * @param eventBulkList 이벤트 벌크 목록
	 * @return byte[] pdfBytes
	 */
	byte[] generatePdf(List<TstEventResponse> eventBulkList) throws Exception;

}
