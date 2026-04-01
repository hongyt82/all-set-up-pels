package com.khnp.pels.api.validation;

import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.common.exception.RestBadRequestException;
import lombok.Value;

@Value
public class StrokeFilename {
    long pwplId;        //발전소ID
    long chckSno;       //시험순번
    int pageCnt;        //페이지번호
    int insrtnPageCnt;  //추가페이지SEQ
    int strkSeq;        //스트로크SEQ

    /**
     * 순수 바이너리 파일명 얻기
     * @param filePath 파일전체경로
     * @return 순수 파일명
     * @apiNote C:\fakepath\stroke_3_2_3_1_1.bin -> stroke_3_2_3_1_1.bin
     */
    public static String baseFileName(String filePath) {
        if (filePath == null) return null;
        String s = filePath.trim();

        // windows / unix 경로 모두 처리
        int slash = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'));
        return (slash >= 0) ? s.substring(slash + 1) : s;
    }

    /**
     * 스트로크 파일명 파싱
     * @param originalFilename 오리지널 파일명
     * @return 스트로크 파일명 객체
     */
    public static StrokeFilename parse(String originalFilename) {
        String filename = baseFileName(originalFilename); //순수 파일명 얻기

        // stroke_{TST_UNQ_KY_VAL}_{PAGE_NO}_{STROKE_SEQ}.bin
        // ex) stroke_3_1_2.bin
        if (filename == null){
            throw new RestBadRequestException("Filename is null");
        }

        String name = filename.trim();
        if (!name.startsWith("stroke_") || !name.endsWith(".bin")){
            throw new RestBadRequestException("Invalid stroke filename: " + filename);
        }

        String core = name.substring("stroke_".length(), name.length() - ".bin".length());
        String[] parts = core.split("_");
        if (parts.length != 5){
            throw new RestBadRequestException("Invalid stroke filename: " + filename);
        }

        long pw = Long.parseLong(parts[0]);
        int c = Integer.parseInt(parts[1]);
        int p = Integer.parseInt(parts[2]);
        int ps = Integer.parseInt(parts[3]);
        int s = Integer.parseInt(parts[4]);

        return new StrokeFilename(pw, c, p, ps, s);
    }

    public String toFilename() {
        return "stroke_" + pwplId
                + "_"  + chckSno
                + "_" + pageCnt
                + "_" + insrtnPageCnt
                + "_" + strkSeq
                + ".bin";
    }

    public static String toFilename(TstEventMeta eventMeta) {
        return "stroke_" + eventMeta.getPwplId()
                + "_" + eventMeta.getChckSno()
                + "_" + eventMeta.getPageCnt()
                + "_" + eventMeta.getInsrtnPageCnt()
                + "_" + eventMeta.getStrkSeq()
                + ".bin";
    }

    public static String responseFilename(Long eventSno) {
        return "stroke_" + eventSno + ".bin";
    }

}