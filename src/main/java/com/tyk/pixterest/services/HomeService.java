package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.PinUserSaveEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.mappers.PinUserSaveMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.vos.SearchVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class HomeService {
    private final PinMapper pinMapper;
    private final PinUserSaveMapper pinUserSaveMapper;

    @Autowired
    public HomeService(PinMapper pinMapper, PinUserSaveMapper pinUserSaveMapper) {
        this.pinMapper = pinMapper;
        this.pinUserSaveMapper = pinUserSaveMapper;
    }

    public PinEntity[] getBySearch(SearchVo searchVo) {
        if (searchVo == null || searchVo.getKeyword() == null || searchVo.getKeyword().isEmpty()) {
            return getHomePinsAll();
        }

        PinEntity[] pins = this.pinMapper.search(searchVo);
        return pins;
    }

    public PinEntity[] getHomePinsAll() {
        return this.pinMapper.selectAll();
    }

    public Result savePin(UserEntity user, PinEntity pin) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        if (user.isSuspended() || user.isDeleted()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }

        if (pin == null) {
            return CommonResult.FAILURE_ABSENT;
        }

        // 원본 핀 존재 체크
        PinEntity dbPin = this.pinMapper.selectById(pin.getId());
        if (dbPin == null) {
            return CommonResult.FAILURE_ABSENT;
        }

        // 중복 저장 체크
        PinUserSaveEntity existingSave = this.pinUserSaveMapper.selectByUserEmailAndPinId(user.getEmail(), pin.getId());
        if (existingSave != null) {
            return CommonResult.FAILURE_DUPLICATE;
        }

        PinUserSaveEntity newSave = new PinUserSaveEntity();
        newSave.setUserEmail(user.getEmail());
        newSave.setPinId(pin.getId());
        newSave.setSavedAt(LocalDateTime.now());

        return this.pinUserSaveMapper.insert(newSave) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
