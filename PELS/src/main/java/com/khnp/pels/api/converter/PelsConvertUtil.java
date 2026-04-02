package com.khnp.pels.api.converter;

import com.khnp.pels.api.dto.TstEventEntity;
import com.khnp.pels.api.dto.TstEventImageEntity;
import com.khnp.pels.api.dto.TstEventMeta;
import com.khnp.pels.api.dto.TstEventStrokeEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

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
