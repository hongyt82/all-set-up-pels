package com.khnp.pels.api.service;

import com.khnp.pels.api.dao.PelsStrokeBatchDao;
import com.khnp.pels.api.dao.PelsStrokeDao;
import com.khnp.pels.api.dto.TstCreateStrokeMeta;
import com.khnp.pels.api.dto.TstDeleteStrokeMeta;
import com.khnp.pels.api.dto.TstStrokeEntity;
import com.khnp.pels.common.exception.RestBadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service("pelsStrokeService")
public class PelsStrokeServiceImpl implements PelsStrokeService {
	private static final Logger logger = LoggerFactory.getLogger(PelsStrokeServiceImpl.class);

	@Autowired
	PelsStrokeDao pelsStrokeDao;

	@Autowired
	PelsStrokeBatchDao mpssStrokeBatchDao;

	/**
	 * 정주기 시험(점검) 스트로크 목록 조회
	 * @param tstUnqKyVal 시험고유키값
	 * @return List<TstStrokeEntity> 스트로크 엔터티 목록
	 */
	@Override
	public List<TstStrokeEntity> getTstStrokeList(Long tstUnqKyVal) {
		return pelsStrokeDao.getTstStrokeList("TstStrokeSelectList", tstUnqKyVal);
	}

	/**
	 * Api 전달 Dto로 변환
	 * @param list 스트로크 엔터티 목록
	 * @return 스트로크 메타 목록
	 */
	public List<Map<String, Object>> toMapList(List<TstStrokeEntity> list) {
		return list.stream().map(e -> {
			Map<String, Object> map = new LinkedHashMap<>();
			map.put("TST_UNQ_KY_VAL", e.getTST_UNQ_KY_VAL());
			map.put("PAGE_NO", e.getPAGE_NO());
			map.put("STROKE_SEQ", e.getSTROKE_SEQ());
			map.put("STROKE_COLOR", e.getSTROKE_COLOR());
			map.put("STROKE_WIDTH", e.getSTROKE_WIDTH());
			map.put("CREPR_ID", e.getCREPR_ID());
			map.put("CRE_DT", e.getCRE_DT());
			return map;
		}).collect(Collectors.toList());
	}

	/**
	 * 정주기 시험(점검) 벌크 스트로크 저장
	 * @param tstStrokeEntityList 시험(점검) 스트로크 객체
	 * @param fileMap 시험(점검) 스트로크 바이너리 파일(s)
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstStrokeBulk(List<TstStrokeEntity> tstStrokeEntityList, Map<String, byte[]> fileMap) {
		// 바이너리 파일 매핑
		for(TstStrokeEntity tstStrokeEntity : tstStrokeEntityList){
			String key = "stroke_"+ tstStrokeEntity.getTST_UNQ_KY_VAL()
					+ "_" + tstStrokeEntity.getPAGE_NO()
					+ "_" + tstStrokeEntity.getSTROKE_SEQ() + ".bin";
			byte[] file = fileMap.get(key);
			if(file == null || file.length == 0){
				throw new RestBadRequestException("File don't exist in fileMap");
			}
			tstStrokeEntity.setPOINT_PATH(file);
		}

		// Batch Insert 호출
		return mpssStrokeBatchDao.insertTstStrokeBatch("TstStrokeInsert", tstStrokeEntityList, 1000);
	}

	/**
	 * 내부 서버 전달 Entity List로 변환
	 * @param list 스트로크 메타 목록
	 * @return 스트로크 엔터티 목록
	 */
	public List<TstStrokeEntity> toEntityList(List<TstCreateStrokeMeta> list) {
		return list.stream().map(e -> TstStrokeEntity.builder()
				.TST_UNQ_KY_VAL(e.getTST_UNQ_KY_VAL())
				.PAGE_NO(e.getPAGE_NO())
				.STROKE_SEQ(e.getSTROKE_SEQ())
				.STROKE_COLOR(e.getSTROKE_COLOR())
				.STROKE_WIDTH(e.getSTROKE_WIDTH())
				.CREPR_ID(e.getCREPR_ID())
				.CRE_DT(e.getCRE_DT())
				.DLTPR_ID(e.getDLTPR_ID())
				.DLT_DT(e.getDLT_DT())
				.build()
		).collect(Collectors.toList());
	}

	/**
	 * 정주기 시험(점검) 단일 스트로크 저장
	 * @param tstStrokeEntity 시험(점검) 스트로크 객체
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int saveTstStroke(TstStrokeEntity tstStrokeEntity) {
		return pelsStrokeDao.insertTstStroke("TstStrokeInsert", tstStrokeEntity);
	}

	/**
	 * 내부 서버 전달 Entity로 변환
	 * @param dto 스트로크 메타 DTO
	 * @return 스트로크 엔터티
	 */
	public TstStrokeEntity toInsertEntity(TstCreateStrokeMeta dto) {
		return TstStrokeEntity.builder()
				.TST_UNQ_KY_VAL(dto.getTST_UNQ_KY_VAL())
				.PAGE_NO(dto.getPAGE_NO())
				.STROKE_SEQ(dto.getSTROKE_SEQ())
				.STROKE_COLOR(dto.getSTROKE_COLOR())
				.STROKE_WIDTH(dto.getSTROKE_WIDTH())
				.CREPR_ID(dto.getCREPR_ID())
				.CRE_DT(dto.getCRE_DT())
				.DLTPR_ID(dto.getDLTPR_ID())
				.DLT_DT(dto.getDLT_DT())
				.build();
	}

	/**
	 * 내부 서버 전달 Entity로 변환
	 * @param dto 스트로크 메타 DTO
	 * @return 스트로크 엔터티
	 */
	public TstStrokeEntity toDeleteEntity(TstDeleteStrokeMeta dto) {
		return TstStrokeEntity.builder()
				.TST_UNQ_KY_VAL(dto.getTST_UNQ_KY_VAL())
				.PAGE_NO(dto.getPAGE_NO())
				.STROKE_SEQ(dto.getSTROKE_SEQ())
				.DLTPR_ID(dto.getDLTPR_ID())
				.DLT_DT(dto.getDLT_DT())
				.build();
	}

	/**
	 * 정주기 시험(점검) 단일 스트로크 삭제
	 * @param tstStrokeEntity 시험(점검) 스트로크 객체
	 * @return int 처리 개수
	 */
	@Override
	@Transactional(rollbackFor = {Exception.class})
	public int deleteTstStroke(TstStrokeEntity tstStrokeEntity) {
		return pelsStrokeDao.updateTstStrokeForDelete("TstStrokeUpdateForDelete", tstStrokeEntity);
	}

}
