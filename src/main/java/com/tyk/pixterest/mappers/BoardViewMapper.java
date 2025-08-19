package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BoardViewMapper {

    BoardEntity selectBoardById(int boardId);

    List<PinEntity> selectPinsByBoardId(int boardId);
}

