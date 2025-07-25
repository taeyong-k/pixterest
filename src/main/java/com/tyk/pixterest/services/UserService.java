package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.UserMapper;
import com.tyk.pixterest.results.*;
import com.tyk.pixterest.utils.CryptoUtils;
import jakarta.servlet.http.HttpSession;
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
        user.setFollowers(0);
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

    public CommonResult logout(UserEntity signedUser, HttpSession session) {
        if (session == null || session.getAttribute("signedUser") == null) {
            return CommonResult.FAILURE;
        }

        // 세션에서 현재 로그인된 사용자 정보
        UserEntity sessionUser = (UserEntity) session.getAttribute("signedUser");

        // ✅ 전달된 signedUser와 세션 유저 정보 비교
        if (!sessionUser.getEmail().equals(signedUser.getEmail())) {
            return CommonResult.FAILURE;
        }

        // ✅ DB에서 사용자 최신 정보 확인
        UserEntity dbUser = this.userMapper.selectByEmail(sessionUser.getEmail());
        if (dbUser == null || !dbUser.getEmail().equals(sessionUser.getEmail())) {
            return CommonResult.FAILURE;
        }

        // ✅ 모든 검증 통과 → 세션 무효화
        session.invalidate();
        return CommonResult.SUCCESS;
    }

    public CommonResult changePassword(UserEntity signedUser , String password, String newPassword)
    {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended())
        {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (password == null || newPassword == null)
        {
            return CommonResult.FAILURE;
        }
        if (!UserService.isPasswordValid(password) || !UserService.isPasswordValid(newPassword))
        {
            return CommonResult.FAILURE;
        }
        if (password.equals(newPassword))
        {
            return CommonResult.FAILURE_DUPLICATE;
        }
        String hashedPassword = CryptoUtils.hashSha512(password);
        UserEntity dbUser = this.userMapper.selectByPassword(hashedPassword);
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended())
        {
            return CommonResult.FAILURE;
        }
        if (!dbUser.getPassword().equals(hashedPassword))
        {
            return CommonResult.FAILURE;
        }
        dbUser.setPassword(CryptoUtils.hashSha512(newPassword));
        return this.userMapper.update(dbUser) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public CommonResult deleteUser(UserEntity signedUser, String email)
    {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended())
        {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (!signedUser.isAdmin() && !signedUser.getEmail().equals(email)) {
            return CommonResult.FAILURE;
        }
        return this.userMapper.delete(email) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public CommonResult deactivateUser(UserEntity signedUser, String email)
    {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended())
        {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (!signedUser.isAdmin() && !signedUser.getEmail().equals(email)) {
            return CommonResult.FAILURE;
        }
        if (!UserService.isEmailValid(email))
        {
            return CommonResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended())
        {
            return CommonResult.FAILURE;
        }
        dbUser.setDeleted(true);
        return this.userMapper.update(dbUser) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
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
