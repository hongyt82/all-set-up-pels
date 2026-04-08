package com.khnp.pels.api.dto;

import com.khnp.pels.api.dto.group.ValidationGroups;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.*;

/**
 * 조회 요청에 대한 DTO
 * @author KwangYong
 * @since 2006-04-06
 */
@Getter
@Setter
public class TstEventSearchRequest {

    @NotBlank(groups = {ValidationGroups.GroupEventBulk.class, ValidationGroups.GroupEventStroke.class})
    @Size(max=20)
    private String pwplId;

    @NotNull(groups = {ValidationGroups.GroupEventBulk.class, ValidationGroups.GroupEventStroke.class})
    @Min(1)
    private Long chckSno;

    @NotNull(groups = {ValidationGroups.GroupEventStroke.class})
    @Min(1) @Max(99999)
    private Integer pageCnt;

}
