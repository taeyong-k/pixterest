package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.PinUserSaveEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.DetailMapper;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.mappers.PinUserSaveMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PinService {
    private final PinMapper pinMapper;
    private final PinUserSaveMapper pinUserSaveMapper;
    private final DetailMapper detailMapper;

    @Autowired
    public PinService(PinMapper pinMapper, PinUserSaveMapper pinUserSaveMapper, DetailMapper detailMapper) {
        this.pinMapper = pinMapper;
        this.pinUserSaveMapper = pinUserSaveMapper;
        this.detailMapper = detailMapper;
    }

    public PinEntity getPinById(Long pinId) {
        if (pinId == null || pinId < 1) {
            return null;
        }
        return this.detailMapper.selectById(pinId);
    }

    public Result savePin(UserEntity user, int pinId) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        if (user.isSuspended() || user.isDeleted()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }

        if (pinId < 1) {
            return CommonResult.FAILURE_ABSENT;
        }

        // 원본 핀 존재 체크
        PinEntity dbPin = this.pinMapper.selectById(pinId);
        if (dbPin == null) {
            return CommonResult.FAILURE_ABSENT;
        }

        // 중복 저장 체크
        PinUserSaveEntity existingSave = this.pinUserSaveMapper.selectByUserEmailAndPinId(user.getEmail(), pinId);
        if (existingSave != null) {
            return CommonResult.FAILURE_DUPLICATE;
        }

        PinUserSaveEntity newSave = new PinUserSaveEntity();
        newSave.setUserEmail(user.getEmail());
        newSave.setPinId(pinId);
        newSave.setSavedAt(LocalDateTime.now());

        return this.pinUserSaveMapper.insert(newSave) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
