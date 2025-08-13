package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.vos.SearchVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PinMapper {
    int insert(@Param(value = "pin") PinEntity pin);

    int update(@Param(value = "pinId") PinEntity pin);

    int updateDelete(@Param(value = "pinId") PinEntity pinId);

    PinEntity selectById(@Param(value = "id") int id);

    PinEntity selectByUserEmailAndId(@Param("userEmail") String userEmail,
                                     @Param("id") int id);

    PinEntity selectFirstNonDeletedPinByBoardId(@Param("boardId") int boardId);

    PinEntity[] search(@Param(value = "searchVo") SearchVo searchVo);

    PinEntity[] selectAll();
}
