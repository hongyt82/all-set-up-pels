package com.khnp.pels.api.controller;

import lombok.experimental.UtilityClass;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Multipart Mixed Writer
 * @author KwangYong
 * @since 2006-02-12
 */
@UtilityClass
public class MultipartMixedWriter {

    private static final byte[] CRLF = "\r\n".getBytes(StandardCharsets.UTF_8);

    public static void begin(HttpServletResponse resp, String boundary) {
        resp.setStatus(200);
        resp.setContentType("multipart/mixed; boundary=" + boundary);
        resp.setCharacterEncoding("UTF-8");
    }

    public static void writeJsonPart(OutputStream os, String boundary, String json) throws Exception {
        os.write(("--" + boundary).getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
        os.write(("Content-Type: application/json; charset=utf-8").getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
        os.write(CRLF);
        os.write(json.getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
    }

    public static void writeBinaryPart(OutputStream os, String boundary, String filename, byte[] bytes) throws Exception {
        os.write(("--" + boundary).getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
        os.write(("Content-Disposition: attachment; filename=\"" + filename + "\"")
                .getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
        os.write(("Content-Type: application/octet-stream").getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
        os.write(("Content-Length: " + (bytes == null ? 0 : bytes.length)).getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
        os.write(CRLF);
        if (bytes != null) os.write(bytes);
        os.write(CRLF);
    }

    public static void end(OutputStream os, String boundary) throws Exception {
        os.write(("--" + boundary + "--").getBytes(StandardCharsets.UTF_8));
        os.write(CRLF);
        os.flush();
    }
}
