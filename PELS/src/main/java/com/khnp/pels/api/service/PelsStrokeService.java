package com.khnp.pels.api.service;

import com.khnp.pels.api.dto.TstCreateStrokeMeta;
import com.khnp.pels.api.dto.TstDeleteStrokeMeta;
import com.khnp.pels.api.dto.TstStrokeEntity;

import java.util.List;
import java.util.Map;

public interface PelsStrokeService {

	/**
	 * 정주기 시험(점검) 스트로크 목록 조회
	 * @param tstUnqKyVal 시험고유키값
	 * @return List<TstStrokeEntity> 스트로크 엔터티 목록
	 */
	List<TstStrokeEntity> getTstStrokeList(Long tstUnqKyVal);

	/**
	 * Api 전달 Map로 변환
	 * @param list 스트로크 엔터티 목록
	 * @return 스트로크 Map 목록
	 */
	List<Map<String, Object>> toMapList(List<TstStrokeEntity> list);

	/**
	 * 정주기 시험(점검) 단일 스트로크 저장
	 * @param tstStrokeEntityList 시험(점검) 스트로크 객체
	 * @param fileMap 시험(점검) 스트로크 바이너리 파일(s)
	 * @return int 처리 개수
	 */
	int saveTstStrokeBulk(List<TstStrokeEntity> tstStrokeEntityList, Map<String, byte[]> fileMap);

	/**
	 * 내부 서버 전달 Entity로 변환
	 * @param list 스트로크 메타 목록
	 * @return 스트로크 엔터티 목록
	 */
	List<TstStrokeEntity> toEntityList(List<TstCreateStrokeMeta> list);

	/**
	 * 정주기 시험(점검) 단일 스트로크 저장
	 * @param tstStrokeEntity 시험(점검) 스트로크 객체
	 * @return int 처리 개수
	 */
	int saveTstStroke(TstStrokeEntity tstStrokeEntity);

	/**
	 * 내부 서버 전달 Entity로 변환
	 * @param dto 스트로크 메타 DTO
	 * @return 스트로크 엔터티
	 */
	TstStrokeEntity toInsertEntity(TstCreateStrokeMeta dto);

	/**
	 * 내부 서버 전달 Entity로 변환
	 * @param dto 스트로크 메타 DTO
	 * @return 스트로크 엔터티
	 */
	TstStrokeEntity toDeleteEntity(TstDeleteStrokeMeta dto);

	/**
	 * 정주기 시험(점검) 단일 스트로크 삭제
	 * @param tstStrokeEntity 시험(점검) 스트로크 객체
	 * @return int 처리 개수
	 */
	int deleteTstStroke(TstStrokeEntity tstStrokeEntity);

}
