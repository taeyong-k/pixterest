package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyPageMapper {
    int boardUpdate (@Param(value = "board") BoardEntity board);

    int pinUpdate (@Param(value = "pin") PinEntity pin);

    BoardEntity selectBoardByBoardId(@Param(value = "boardId") int boardId);

    List<BoardEntity> selectBoardsByEmail(@Param(value = "email") String email);

    PinEntity selectPinByPinId(@Param(value = "pinId") int pinId);

    List<PinEntity> selectPinsByEmail(@Param(value = "email") String email);

    List<PinEntity> selectSavedPinsByEmail(@Param(value = "email") String email);

    List<PinEntity> selectPinsByBoardId(@Param(value = "boardId") int boardId);

}
