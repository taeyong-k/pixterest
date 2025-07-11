package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.BoardEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BoardMapper {
    int insert(@Param(value = "board") BoardEntity board);

    BoardEntity selectByUserEmailAndName(@Param("userEmail") String userEmail,
                                         @Param("name") String name);

    BoardEntity selectById(@Param(value = "id")  int id);
}
