package com.khnp.pels.api.converter;

import java.math.BigDecimal;

/**
 * 이벤트 데이터 컨버터 유틸
 * @author KwangYong
 * @since 2006-03-22
 */
public class PelsConvertUtil {

    /**
     * 음수 값을 0으로 변환
     * @param value
     * @return
     */
    public static BigDecimal zeroIfNegitive(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return value;
    }

}
