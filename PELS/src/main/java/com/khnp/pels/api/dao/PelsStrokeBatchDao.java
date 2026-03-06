package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstStrokeEntity;

import java.util.List;

public interface PelsStrokeBatchDao {

	int insertTstStrokeBatch(String mapperId, List<TstStrokeEntity> list, int batchSize);

}
