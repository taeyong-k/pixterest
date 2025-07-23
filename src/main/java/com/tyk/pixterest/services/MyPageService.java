package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.PinUserSaveEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MyPageService {

    private final UserMapper userMapper;

    @Autowired
    public MyPageService(UserMapper userMapper) {
        this.userMapper = userMapper;
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

        return this.userMapper.selectBoardsByEmail(email);
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
        return this.userMapper.selectPinsByEmail(email);
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

        return this.userMapper.selectSavedPinsByEmail(email);
    }

}
