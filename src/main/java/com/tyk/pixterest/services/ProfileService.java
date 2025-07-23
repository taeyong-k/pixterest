package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.UserMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ProfileService {

    private final UserMapper userMapper;

    @Autowired
    public ProfileService(UserMapper userMapper) {
        this.userMapper = userMapper;

    }

    public ResultTuple<UserEntity> getInfo(UserEntity signedUser)
    {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended())
        {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE_SESSION_EXPIRED)
                    .build();
        }
        UserEntity dbUser = this.userMapper.selectByEmail(signedUser.getEmail());
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended())
        {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE_SESSION_EXPIRED)
                    .payload(null)
                    .build();
        }
        return ResultTuple.<UserEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbUser)
                .build();
    }

    public CommonResult saveInfo(UserEntity signedUser,UserEntity user)
    {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended())
        {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        UserEntity dbUser = this.userMapper.selectByEmail(signedUser.getEmail());
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended())
        {
            return CommonResult.FAILURE;
        }

        user.setEmail(dbUser.getEmail()); // Email은 기존값 유지

        // 요청에 포함된 값만 업데이트
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            dbUser.setFirstName(user.getFirstName());
        }
        if (user.getName() != null && !user.getName().isBlank()) {
            dbUser.setName(user.getName());
        }
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            dbUser.setNickname(user.getNickname());
        }
        if (user.getSite() != null && !user.getSite().isBlank()) {
            dbUser.setSite(user.getSite());
        }
        if (user.getIntroduce() != null && !user.getIntroduce().isBlank()) {
            dbUser.setIntroduce(user.getIntroduce());
        }
        if (user.getBirth() != null) {
            dbUser.setBirth(user.getBirth());
        }
        if (user.getFollowers() >= 0) {
            dbUser.setFollowers(user.getFollowers());
        }

        dbUser.setModifiedAt(LocalDateTime.now());
        dbUser.setDeleted(false);
        dbUser.setSuspended(false);
        dbUser.setAdmin(false);

        return this.userMapper.update(dbUser) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public CommonResult controlProfileColor(UserEntity signedUser, String profileColor)
    {
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {

            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        // HEX 유효성 검사
        if (!profileColor.matches("^#[0-9A-Fa-f]{6}$"))
        {
            return CommonResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectByEmail(signedUser.getEmail());
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended())
        {
            return CommonResult.FAILURE;
        }
        dbUser.setProfileColor(profileColor);
        return this.userMapper.update(dbUser) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
