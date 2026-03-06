package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstStrokeEntity;

import java.util.List;

public interface PelsStrokeDao {

	List<TstStrokeEntity> getTstStrokeList(String mapperId, Long tstUnqKyVal);

	int insertTstStroke(String mapperId, TstStrokeEntity tstStrokeEntity);

	int updateTstStrokeForDelete(String mapperId, TstStrokeEntity tstStrokeEntity);

}
