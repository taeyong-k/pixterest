package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.UserMapper;
import com.tyk.pixterest.results.*;
import com.tyk.pixterest.utils.CryptoUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService
{
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public static boolean isEmailValid(String input)
    {
        return input != null && input.matches("^(?=.{8,50}$)([\\da-z\\-_.]{4,})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2,3})?$");
    }

    public static boolean isPasswordValid(String input)
    {
        return input != null && input.matches("^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]}\\\\|;:'\",<.>/?]{8,50})$");
    }

    public static boolean isBirthValid(String input)
    {
        return input != null && input.matches("^(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$");
    }

    public Result register(UserEntity user)
    {
        if (user == null)
        {
            return CommonResult.FAILURE;
        }
        if (user.getEmail() == null ||
                user.getPassword() == null ||
                user.getBirth() == null)
        {
            return CommonResult.FAILURE;
        }
        if (!isEmailValid(user.getEmail()) ||
                !isPasswordValid(user.getPassword()))
        {
            return CommonResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectByEmail(user.getEmail());
        if (dbUser != null)
        {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }
        String email = user.getEmail();
        String emailId = email.split("@")[0];

        user.setEmail(user.getEmail());
        user.setPassword(CryptoUtils.hashSha512(user.getPassword()));
        user.setName(emailId);
        user.setNickname(emailId);
        user.setBirth(user.getBirth());
        user.setCreatedAt(LocalDateTime.now());
        user.setModifiedAt(LocalDateTime.now());
        user.setDeleted(false);
        user.setSuspended(false);
        user.setAdmin(false);
        return this.userMapper.insert(user) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public ResultTuple<UserEntity> Login(String email, String password)
    {
        if (email == null || password == null)
        {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (!UserService.isEmailValid(email) || !UserService.isPasswordValid(password))
        {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null || dbUser.isDeleted())
        {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        String hashedPassword = CryptoUtils.hashSha512(password);
        if (!dbUser.getPassword().equals(hashedPassword))
        {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (dbUser.isSuspended())
        {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE_SUSPENDED)
                    .build();
        }
        return ResultTuple.<UserEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbUser)
                .build();
    }

    public CommonResult getInfo()
    {
        return null;
    }

    public ResultTuple<String> getTheme(UserEntity signedUser, String theme)
    {
        if (signedUser == null)
        {
            return ResultTuple.<String>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (theme == null)
        {
            return ResultTuple.<String>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }

        return null;
    }

    public CommonResult saveUserTheme(UserEntity signedUser, String theme)
    {
        return null;
    }
}
