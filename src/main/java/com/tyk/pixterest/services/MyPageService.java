package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.MyPageMapper;
import com.tyk.pixterest.mappers.UserMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.ModifyBoardResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MyPageService {

    private final UserMapper userMapper;
    private final MyPageMapper myPageMapper;

    @Autowired
    public MyPageService(UserMapper userMapper, MyPageMapper myPageMapper) {
        this.userMapper = userMapper;
        this.myPageMapper = myPageMapper;
    }

    public static boolean isEmailValid(String input)
    {
        return input != null && input.matches("^(?=.{8,50}$)([\\da-z\\-_.]{4,})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2,3})?$");
    }

    public List<BoardEntity> getBoardsByUser(String email)
    {
        if (email == null || email.isEmpty())
        {
            return null;
        }
        if (!MyPageService.isEmailValid(email))
        {
            return null;
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null)
        {
            return null;
        }
        if (dbUser.isDeleted() || dbUser.isSuspended())
        {
            return null;
        }

        return this.myPageMapper.selectBoardsByEmail(email);
    }

    public List<PinEntity> getPinsByUser(String email)
    {
        if (email == null || email.isEmpty())
        {
            return null;
        }
        if (!MyPageService.isEmailValid(email))
        {
            return null;
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null)
        {
            return null;
        }
        if (dbUser.isDeleted() || dbUser.isSuspended())
        {
            return null;
        }
        return this.myPageMapper.selectPinsByEmail(email);
    }

    public List<PinEntity> getSavedPinsByUser(String email)
    {
        if (email == null || email.isEmpty())
        {
            return new ArrayList<>();
        }
        if (!MyPageService.isEmailValid(email))
        {
            return new ArrayList<>();
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null)
        {
            return new ArrayList<>();
        }
        if (dbUser.isDeleted() || dbUser.isSuspended())
        {
            return new ArrayList<>();
        }

        return this.myPageMapper.selectSavedPinsByEmail(email);
    }

    public ResultTuple<BoardEntity> getBoardByBoardId(UserEntity signedUser, int boardId)
    {
        // 1. 사용자 상태 검사
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended())
        {
            return ResultTuple.<BoardEntity>builder()
                    .result(ModifyBoardResult.FAILURE_SESSION_EXPIRED)
                    .payload(null)
                    .build();
        }

        // 2. 게시판 조회
        BoardEntity board = myPageMapper.selectBoardByBoardId(boardId);
        if (board == null) {
            return ResultTuple.<BoardEntity>builder()
                    .result(ModifyBoardResult.FAILURE_NOT_FOUND)
                    .payload(null)
                    .build();
        }

        // 3. 상태 확인
        if (board.isDeleted()) {
            return ResultTuple.<BoardEntity>builder()
                    .result(ModifyBoardResult.FAILURE_DELETED)
                    .payload(null)
                    .build();
        }

        // 5. 성공
        return ResultTuple.<BoardEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(board)
                .build();
    }

    public List<PinEntity> getPinsByBoardId(int boardId) {
        return myPageMapper.selectPinsByBoardId(boardId);
    }

    public Result saveBoard(UserEntity signedUser, BoardEntity board) {
        // 1. 사용자 상태 검사
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ModifyBoardResult.FAILURE_SESSION_EXPIRED;
        }

        // 2. 게시판 존재 확인
        BoardEntity dbBoard = this.myPageMapper.selectBoardByBoardId(board.getId());
        if (dbBoard == null) {
            return ModifyBoardResult.FAILURE_NOT_FOUND;
        }

        // 3. 게시판 업데이트
        dbBoard.setName(board.getName());
        dbBoard.setCoverImage(board.getCoverImage());
        dbBoard.setModifiedAt(LocalDateTime.now());

        boolean updated = this.myPageMapper.boardUpdate(dbBoard) > 0;
        return updated ? CommonResult.SUCCESS : CommonResult.FAILURE; // 새 FAILURE 추가 가능
    }


}
