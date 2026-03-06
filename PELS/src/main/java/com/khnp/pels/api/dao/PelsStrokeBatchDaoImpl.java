package com.khnp.pels.api.dao;

import com.khnp.pels.api.dto.TstStrokeEntity;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.List;

@Repository("mpssStrokeBatchDao")
public class PelsStrokeBatchDaoImpl implements PelsStrokeBatchDao {
	
	@Autowired
	@Resource(name="batchSqlSession")
	private SqlSession batchSqlSession;

	@Override
	public int insertTstStrokeBatch(String mapperId, List<TstStrokeEntity> list, int batchSize) {
		int cnt = 0;

        for (TstStrokeEntity tstStrokeEntity : list) {
            batchSqlSession.insert(mapperId, tstStrokeEntity);
            cnt++;

            // 일정 단위로 JDBC batch 실행
            if (cnt % batchSize == 0) {
                batchSqlSession.flushStatements();  //DB서버로 실행
            }
        }

		// 잔여분 실행
		batchSqlSession.flushStatements();
		return cnt;
	}

}
