package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.BoardEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BoardMapper {
    BoardEntity selectById(@Param(value = "id")  int id);
}
