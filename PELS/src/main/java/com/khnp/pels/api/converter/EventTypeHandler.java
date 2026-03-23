package com.khnp.pels.api.converter;

import com.khnp.pels.api.validation.EventType;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedTypes(EventType.class)
public class EventTypeHandler extends BaseTypeHandler<EventType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, EventType parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, parameter.getValue());
    }

    @Override
    public EventType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return EventType.fromValue(rs.getInt(columnName));
    }

    @Override
    public EventType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return EventType.fromValue(rs.getInt(columnIndex));
    }

    @Override
    public EventType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return EventType.fromValue(cs.getInt(columnIndex));
    }
}
