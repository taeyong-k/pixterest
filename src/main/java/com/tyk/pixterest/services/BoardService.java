package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.mappers.BoardMapper;
import com.tyk.pixterest.mappers.BoardViewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardService {
    private final BoardViewMapper boardViewMapper;

    @Autowired
    public BoardService(BoardViewMapper boardViewMapper) {
        this.boardViewMapper = boardViewMapper;
    }

    public BoardEntity getBoardById(int boardId) {
        return boardViewMapper.selectBoardById(boardId);
    }

    public List<PinEntity> getPintykBoardId(int boardId) {
        return boardViewMapper.selectPinsByBoardId(boardId);
    }

}
