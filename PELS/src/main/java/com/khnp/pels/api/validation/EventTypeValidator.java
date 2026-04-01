package com.khnp.pels.api.validation;

import com.khnp.pels.api.dto.TstEventImageMeta;
import com.khnp.pels.api.dto.TstEventMeta;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class EventTypeValidator implements ConstraintValidator<ValidEventTypeCondition, TstEventMeta> {

    /**
     * 검증
     * @param dto
     * @param context
     * @return
     */
    @Override
    public boolean isValid(TstEventMeta dto, ConstraintValidatorContext context) {

        if (dto == null) return true;

        if (dto.getEventTypSqno() == null) return false;

        boolean valid = true;

        context.disableDefaultConstraintViolation();

        // EVENT 메타 검증
        switch (dto.getEventTypSqno()) {
            case PAGE_ADD:
            case PAGE_DELETE:
                valid &= require(context, dto.getPdfPageCnt(), "pdfPageNo");
                valid &= forbidden(context, dto.getStrkSeq(), "strkSeq");
                valid &= forbidden(context, dto.getImgId(), "imgId");
                valid &= forbidden(context, dto.getStroke(), "stroke");
                valid &= forbidden(context, dto.getImage(), "image");
                break;

            case STROKE_ADD:
                valid &= require(context, dto.getStroke(), "stroke");
            case STROKE_DELETE:
                valid &= require(context, dto.getStrkSeq(), "strkSeq");
                valid &= forbidden(context, dto.getPdfPageCnt(), "pdfPageNo");
                break;

            case IMAGE_CONTAINER_ADD:
            case IMAGE_UPSERT:
            case IMAGE_RESIZE:
                valid &= require(context, dto.getImage(), "image");
            case IMAGE_DELETE:
                valid &= forbidden(context, dto.getPdfPageCnt(), "pdfPageNo");
                valid &= require(context, dto.getImgId(), "imgId");
                break;
            default:
        }

        // IMAGE 메타 검증
        TstEventImageMeta imageDto = dto.getImage();
        if(imageDto != null){
            switch (dto.getEventTypSqno()) {
                case IMAGE_CONTAINER_ADD:
                    valid &= forbidden(context, imageDto.getUrlInfo(), "image.urlInfo");
                    break;
                case IMAGE_UPSERT:
                    valid &= require(context, imageDto.getUrlInfo(), "image.urlInfo");
                    break;
                default:
            }
        }

        return valid;
    }

    /**
     * 필수값 검증
     */
    private boolean require(ConstraintValidatorContext context, Object value, String field) {
        if (value == null) {
            addError(context, field, field + "는 필수입니다");
            return false;
        }
        return true;
    }

    /**
     * 존재하면 안되는 값 검증
     */
    private boolean forbidden(ConstraintValidatorContext context, Object value, String field) {
        if (value != null) {
            addError(context, field, field + "는 존재하면 안됩니다");
            return false;
        }
        return true;
    }

    /**
     * 공통 에러 추가
     */
    private void addError(ConstraintValidatorContext context, String field, String message) {
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(field)
                .addConstraintViolation();
    }

}
