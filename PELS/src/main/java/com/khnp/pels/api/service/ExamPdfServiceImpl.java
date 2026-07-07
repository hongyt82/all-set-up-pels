package com.khnp.pels.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.state.RenderingMode;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import javax.servlet.ServletContext;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;

@Service("examPdfService")
public class ExamPdfServiceImpl implements ExamPdfService {

	@Autowired
	private ServletContext servletContext;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public byte[] generateExamPdf(String pdfPath, String overlayJson) throws Exception {

		byte[] pdfBytes = downloadPdf(pdfPath);

		Map<String, Object> root = objectMapper.readValue(overlayJson, Map.class);
		List<Map<String, Object>> pages = (List<Map<String, Object>>) root.get("pages");

		if (pages == null || pages.isEmpty()) {
			return pdfBytes;
		}

		try (PDDocument document = Loader.loadPDF(pdfBytes)) {
//			try (PDDocument document = PDDocument.load(file)) {
//			try (PDDocument document = Loader.loadPDF(file)) {

			PDType0Font font = loadFont(document);

			for (Map<String, Object> pageJson : pages) {
				int pageNo = toInt(pageJson.get("page"), 0);
				if (pageNo <= 0 || pageNo > document.getNumberOfPages()) continue;

				PDPage page = document.getPage(pageNo - 1);
				float pageW = page.getMediaBox().getWidth();
				float pageH = page.getMediaBox().getHeight();

				List<Map<String, Object>> components =
						(List<Map<String, Object>>) pageJson.get("components");

				try (PDPageContentStream cs = new PDPageContentStream(
						document,
						page,
						PDPageContentStream.AppendMode.APPEND,
						true,
						true
				)) {
					drawPathData(cs, pageJson, pageW, pageH);

					if (components != null && !components.isEmpty()) {
						for (Map<String, Object> c : components) {
							drawComponent(cs, font, c, pageW, pageH);
						}
					}
				}
			}

			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			document.save(baos);
			return baos.toByteArray();
		}
	}

	private byte[] downloadPdf(String pdfPath) throws Exception {
		URL url = new URL(pdfPath);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.setConnectTimeout(15000);
		conn.setReadTimeout(15000);

		try (InputStream is = conn.getInputStream();
		     ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

			byte[] buffer = new byte[8192];
			int len;

			while ((len = is.read(buffer)) != -1) {
				baos.write(buffer, 0, len);
			}

			return baos.toByteArray();
		}
	}

	private PDType0Font loadFont(PDDocument document) throws Exception {
		String fontPath = servletContext.getRealPath("/resources/assets/fonts/NanumGothic.ttf");
		return PDType0Font.load(document, new java.io.File(fontPath));
	}

	private void drawComponent(
			PDPageContentStream cs,
			PDType0Font font,
			Map<String, Object> c,
			float pageW,
			float pageH
	) throws Exception {

		String type = str(c.get("type"));
		String value = str(c.get("value"));

		if (value == null) value = "";

		float srcW = toFloat(c.get("pageWidth"), 0f);
		float srcH = toFloat(c.get("pageHeight"), 0f);

		float x;
		float y;
		float w;
		float h;

		if (c.get("xPct") != null || c.get("yPct") != null) {
			float xPct = toFloat(c.get("xPct"), 0f);
			float yPct = toFloat(c.get("yPct"), 0f);
			float wPct = toFloat(c.get("wPct"), 0f);
			float hPct = toFloat(c.get("hPct"), 0f);

			w = wPct * pageW;
			h = hPct * pageH;
			x = xPct * pageW;
			y = pageH - (yPct * pageH + h);
		} else {
			float jsonPageW = 720f;
			float jsonPageH = 1018.8907f;

			float sx = pageW / jsonPageW;
			float sy = pageH / jsonPageH;

			x = toFloat(c.get("x"), 0f) * sx;
			w = toFloat(c.get("width"), 0f) * sx;
			h = toFloat(c.get("height"), 0f) * sy;
			y = pageH - ((toFloat(c.get("y"), 0f) * sy) + h);
		}

		if ("textbox".equals(type)
				|| "textbox_multiline".equals(type)
				|| "textbox_name".equals(type)
				|| "textbox_verifier".equals(type)) {
			drawText(cs, font, value, x, y, w, h, 9f, "left");
			return;
		}

		if ("textbox_num".equals(type)) {
			drawText(cs, font, value, x, y, w, h, 9f, "center");
			return;
		}

		if ("calendar".equals(type)) {
			drawText(cs, font, value, x, y, w, h, 9f, "center");
			return;
		}

		if ("satisfactionbox".equals(type)) {
			String txt = "";
			if ("good".equalsIgnoreCase(value)) txt = "만족";
			if ("bad".equalsIgnoreCase(value)) txt = "불만족";
			drawText(cs, font, txt, x, y, w, h, 9f, "center");
			return;
		}

		if ("button_ox".equals(type)
				|| "button_oxn".equals(type)
				|| "button_oxt".equals(type)
				|| "button_oxtn".equals(type)) {
			String txt = "";
			if ("o".equalsIgnoreCase(value)) txt = "O";
			if ("x".equalsIgnoreCase(value)) txt = "X";
			if ("n".equalsIgnoreCase(value)) txt = "N";
			if ("t".equalsIgnoreCase(value)) txt = "T";
			drawText(cs, font, txt, x, y, w, h, 12f, "center");
			return;
		}

		if ("checkbox".equals(type)) {
			if ("y".equalsIgnoreCase(value)) {
				drawCheck(cs, x, y, w, h);
			}
			return;
		}

		if ("circleslash".equals(type)) {
			drawCircleSlash(cs, font, value, x, y, w, h);
		}
	}

	private void drawText(
			PDPageContentStream cs,
			PDType0Font font,
			String text,
			float x,
			float y,
			float w,
			float h,
			float fontSize,
			String align
	) throws Exception {

		if (text == null || "".equals(text)) return;

		float textWidth = font.getStringWidth(text) / 1000f * fontSize;
		float tx = x + 2;

		if ("center".equals(align)) {
			tx = x + Math.max(1, (w - textWidth) / 2);
		}

		float ty = y + Math.max(1, (h - fontSize) / 2);

		cs.beginText();
		cs.setFont(font, fontSize);
		cs.newLineAtOffset(tx, ty);
		cs.showText(text);
		cs.endText();
	}

	private void drawCheck(PDPageContentStream cs, float x, float y, float w, float h) throws Exception {
		cs.setLineWidth(Math.max(1f, Math.min(w, h) * 0.12f));
		cs.moveTo(x + w * 0.22f, y + h * 0.52f);
		cs.lineTo(x + w * 0.44f, y + h * 0.28f);
		cs.lineTo(x + w * 0.80f, y + h * 0.76f);
		cs.stroke();
	}

	private void drawCircleSlash(
			PDPageContentStream cs,
			PDType0Font font,
			String value,
			float x,
			float y,
			float w,
			float h
	) throws Exception {

		String v = value == null ? "" : value.toLowerCase();

		if ("".equals(v)) return;

		float cx = x + w / 2;
		float cy = y + h / 2;
		float r = Math.min(w, h) * 0.38f;

		if ("na".equals(v)) {
			drawText(cs, font, "N/A", x, y, w, h, 8f, "center");
			return;
		}

		if ("c".equals(v) || "cs".equals(v)) {
			drawCircle(cs, cx, cy, r);

			if ("cs".equals(v)) {
				cs.setLineWidth(Math.max(1f, r * 0.18f));
				cs.moveTo(cx + r * 0.7f, cy + r * 0.7f);
				cs.lineTo(cx - r * 0.7f, cy - r * 0.7f);
				cs.stroke();
			}
		}
	}

	private void drawCircle(PDPageContentStream cs, float cx, float cy, float r) throws Exception {
		float k = 0.552284749831f;
		cs.setLineWidth(Math.max(0.7f, r * 0.12f));

		cs.moveTo(cx + r, cy);
		cs.curveTo(cx + r, cy + k * r, cx + k * r, cy + r, cx, cy + r);
		cs.curveTo(cx - k * r, cy + r, cx - r, cy + k * r, cx - r, cy);
		cs.curveTo(cx - r, cy - k * r, cx - k * r, cy - r, cx, cy - r);
		cs.curveTo(cx + k * r, cy - r, cx + r, cy - k * r, cx + r, cy);
		cs.stroke();
	}


	private String str(Object value) {
		return value == null ? "" : String.valueOf(value);
	}

	@SuppressWarnings("unchecked")
	private void drawPathData(
			PDPageContentStream cs,
			Map<String, Object> pageJson,
			float pageW,
			float pageH
	) throws Exception {

		Object pathObj = pageJson.get("pathData");

		if (!(pathObj instanceof List)) {
			return;
		}

		List<Map<String, Object>> paths =
				(List<Map<String, Object>>) pathObj;

		if (paths.isEmpty()) {
			return;
		}

		float srcW = toFloat(pageJson.get("width"), pageW);
		float srcH = toFloat(pageJson.get("height"), pageH);

		if (srcW <= 0) srcW = pageW;
		if (srcH <= 0) srcH = pageH;

		float sx = pageW / srcW;
		float sy = pageH / srcH;
		float strokeScale = (sx + sy) / 2f;

		for (Map<String, Object> path : paths) {
			Object pointsObj = path.get("points");

			if (!(pointsObj instanceof List)) {
				continue;
			}

			List<Object> points = (List<Object>) pointsObj;

			if (points.size() < 4) {
				continue;
			}

			int idx = 0;

			int x = int16x2ToInt32(
					toInt(points.get(idx), 0),
					toInt(points.get(idx + 1), 0)
			);
			idx += 2;

			int y = int16x2ToInt32(
					toInt(points.get(idx), 0),
					toInt(points.get(idx + 1), 0)
			);
			idx += 2;

			cs.setLineWidth(
					Math.max(
							0.5f,
							toFloat(
									path.get("strokeWidth"),
									toFloat(path.get("strokWidth"), 1f)
							) * strokeScale
					)
			);

			setStrokeColor(
					cs,
					toLong(path.get("color"), 0xff000000L)
			);

			cs.moveTo(
					(x / 100f) * sx,
					pageH - ((y / 100f) * sy)
			);

			while (idx + 1 < points.size()) {
				x += toInt(points.get(idx), 0);
				y += toInt(points.get(idx + 1), 0);
				idx += 2;

				cs.lineTo(
						(x / 100f) * sx,
						pageH - ((y / 100f) * sy)
				);
			}

			cs.stroke();
		}
	}

	private int int16x2ToInt32(int low, int high) {
		return ((high & 0xffff) << 16) | (low & 0xffff);
	}

	private long toLong(Object value, long defaultValue) {
		try {
			return Long.parseLong(String.valueOf(value));
		} catch (Exception e) {
			return defaultValue;
		}
	}

	private void setStrokeColor(
			PDPageContentStream cs,
			long color
	) throws Exception {

		long u = color;

		if (u < 0) {
			u = u & 0xffffffffL;
		}

		float r = ((u >> 16) & 0xff) / 255f;
		float g = ((u >> 8) & 0xff) / 255f;
		float b = (u & 0xff) / 255f;

		cs.setStrokingColor(r, g, b);
	}

	private int toInt(Object value, int defaultValue) {
		try {
			return Integer.parseInt(String.valueOf(value));
		} catch (Exception e) {
			return defaultValue;
		}
	}

	private float toFloat(Object value, float defaultValue) {
		try {
			return Float.parseFloat(String.valueOf(value));
		} catch (Exception e) {
			return defaultValue;
		}
	}

}

