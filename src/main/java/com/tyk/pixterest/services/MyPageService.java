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

    public List<BoardEntity> getBoardtykUser(String email)
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

        return this.myPageMapper.selectBoardtykEmail(email);
    }

    public List<PinEntity> getPintykUser(String email)
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
        return this.myPageMapper.selectPintykEmail(email);
    }

    public List<PinEntity> getSavedPintykUser(String email)
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

        return this.myPageMapper.selectSavedPintykEmail(email);
    }

    public ResultTuple<BoardEntity> getBoardByBoardId(UserEntity signedUser, int boardId)
    {
        // 1. 사용자 상태 검사
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
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

        // 4. 권한 확인
        if (!signedUser.isAdmin()) {
            return ResultTuple.<BoardEntity>builder()
                    .result(ModifyBoardResult.FAILURE_NO_PERMISSION)
                    .payload(null)
                    .build();
        }

        // 5. 성공
        return ResultTuple.<BoardEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(board)
                .build();
    }


    public List<PinEntity> getPintykBoardId(int boardId) {
        return myPageMapper.selectPintykBoardId(boardId);
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

    public Result deletePinAtBoard(UserEntity signedUser, int pinId)
    {
        // 1. 사용자 상태 검사
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ModifyBoardResult.FAILURE_SESSION_EXPIRED;
        }

        // 2. 핀 존재 확인
        PinEntity dbPin = this.myPageMapper.selectPinByPinId(pinId);
        if (dbPin == null) {
            return ModifyBoardResult.FAILURE_NOT_FOUND;
        }

        // 3. 커버 이미지 여부 확인
        if (dbPin.getBoardId() != null) {
            BoardEntity board = this.myPageMapper.selectBoardByBoardId(dbPin.getBoardId());
            if (board != null && board.getCoverImage() != null
                    && board.getCoverImage().equals(dbPin.getImage())) {
                // 커버 이미지가 삭제할 핀과 같으면 null로 초기화
                board.setCoverImage(null);
                board.setModifiedAt(LocalDateTime.now());
                this.myPageMapper.boardUpdate(board);
            }
        }

        // 4. 핀 삭제 처리
        dbPin.setBoardId(null);
        dbPin.setModifiedAt(LocalDateTime.now());

        boolean updated = this.myPageMapper.pinUpdate(dbPin) > 0;
        return updated ? CommonResult.SUCCESS : CommonResult.FAILURE; // 필요 시 FAILURE_PIN_DELETE_FAIL 등 추가 가능
    }

    public Result deleteBoard(UserEntity signedUser, int boardId) {
        // 1. 사용자 상태 검사
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return ModifyBoardResult.FAILURE_SESSION_EXPIRED;
        }

        // 2. 게시판 존재 확인
        BoardEntity dbBoard = this.myPageMapper.selectBoardByBoardId(boardId);
        if (dbBoard == null) {
            return ModifyBoardResult.FAILURE_NOT_FOUND;
        }

        // 3. 이미 삭제된 보드인지 확인
        if (dbBoard.isDeleted()) {
            return ModifyBoardResult.FAILURE_DELETED;
        }

        // 4. 보드 삭제 처리
        dbBoard.setDeleted(true);
        dbBoard.setModifiedAt(LocalDateTime.now());

        boolean updated = this.myPageMapper.boardUpdate(dbBoard) > 0;
        return updated ? CommonResult.SUCCESS : CommonResult.FAILURE; // 필요 시 FAILURE_BOARD_DELETE_FAIL 추가 가능
    }

}
