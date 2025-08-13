package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.MyPageMapper;
import com.tyk.pixterest.mappers.UserMapper;
import com.tyk.pixterest.results.CommonResult;
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

    public BoardEntity getBoardByBoardId(UserEntity signedUser,int boardId)
    {
        return myPageMapper.selectBoardByBoardId(boardId);
    }

    public List<PinEntity> getPintykBoardId(int boardId) {
        return myPageMapper.selectPintykBoardId(boardId);
    }

    public CommonResult saveBoard(UserEntity signedUser, BoardEntity board)
    {
        BoardEntity dbBoard = this.myPageMapper.selectBoardByBoardId(board.getId());
        if (dbBoard == null)
        {
            return CommonResult.FAILURE;
        }
        dbBoard.setName(board.getName());
        dbBoard.setCoverImage(board.getCoverImage());
        dbBoard.setModifiedAt(LocalDateTime.now());
        return this.myPageMapper.boardUpdate(dbBoard) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public CommonResult deletePinAtBoard(UserEntity signedUser, int pinId)
    {
        PinEntity dbPin = this.myPageMapper.selectPinByPinId(pinId);
        if (dbPin == null)
        {
            return CommonResult.FAILURE;
        }
        dbPin.setBoardId(null);
        dbPin.setModifiedAt(LocalDateTime.now());
        return this.myPageMapper.pinUpdate(dbPin) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public CommonResult deleteBoard(UserEntity signedUser, int boardId)
    {
        BoardEntity dbBoard = this.myPageMapper.selectBoardByBoardId(boardId);
        if (dbBoard == null)
        {
            return CommonResult.FAILURE;
        }
        dbBoard.setDeleted(true);
        dbBoard.setModifiedAt(LocalDateTime.now());
        return this.myPageMapper.boardUpdate(dbBoard) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
