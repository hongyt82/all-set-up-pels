package com.khnp.pels.api.validation;

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

        if (dto.getEventTyp() == null) return false;

        boolean valid = true;

        context.disableDefaultConstraintViolation();

        switch (dto.getEventTyp()) {
            case PAGE_ADD:
            case PAGE_DELETE:
                valid &= require(context, dto.getPdfPageNo(), "PDF_PAGE_NO");
                valid &= forbidden(context, dto.getStrkSeq(), "STRK_SEQ");
                valid &= forbidden(context, dto.getImgId(), "IMG_ID");
                valid &= forbidden(context, dto.getStroke(), "STROKE");
                valid &= forbidden(context, dto.getImage(), "IMAGE");
                break;

            case STROKE_ADD:
                valid &= require(context, dto.getStroke(), "STROKE");
            case STROKE_DELETE:
                valid &= require(context, dto.getStrkSeq(), "STRK_SEQ");
                valid &= forbidden(context, dto.getPdfPageNo(), "PDF_PAGE_NO");
                break;

            case IMAGE_ADD:
            case IMAGE_MODIFY:
            case IMAGE_RESIZE:
                valid &= require(context, dto.getImage(), "IMAGE");
            case IMAGE_DELETE:
                valid &= require(context, dto.getImgId(), "IMG_ID");
                valid &= forbidden(context, dto.getPdfPageNo(), "PDF_PAGE_NO");
                break;
            default:
                return valid;
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
