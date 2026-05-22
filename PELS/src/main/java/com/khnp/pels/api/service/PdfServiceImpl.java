package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstEventResponse;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.servlet.ServletContext;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.List;

/**
 * 이벤트 서비스 구현
 * @author KwangYong
 * @since 2006-05-19
 */
@Service("pdfService")
public class PdfServiceImpl implements PdfService {

	private static final Logger logger = LoggerFactory.getLogger(PdfServiceImpl.class);

	@Autowired
	private ServletContext servletContext;

	@Autowired
	private SpringTemplateEngine templateEngine;

	/**
	 * 이벤트 목록 PDF 생성
	 * @param eventBulkList 이벤트 벌크 목록
	 * @return byte[] pdfBytes
	 */
	public byte[] generatePdf(List<TstEventResponse> eventBulkList) throws Exception{
		Context context = new Context();
		context.setVariable("eventBulkList", eventBulkList);

		// Thymeleaf engine
		String html = templateEngine.process("pdf-timestamp-log", context);
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		// PDF Builder
		PdfRendererBuilder builder = new PdfRendererBuilder();
		builder.useFastMode();
		builder.withHtmlContent(html, null);

		// 한글 폰트
		String fontPath = servletContext.getRealPath("/resources/assets/fonts/NanumGothic.ttf");
		builder.useFont(new File(fontPath), "NanumGothic");
		builder.toStream(outputStream);
		builder.run();

		return outputStream.toByteArray();
	}

}
