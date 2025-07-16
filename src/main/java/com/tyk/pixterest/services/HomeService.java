package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.CreationResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.vos.SearchVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class HomeService {
    private final PinMapper pinMapper;

    @Autowired
    public HomeService(PinMapper pinMapper) {
        this.pinMapper = pinMapper;
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
        PinEntity existingPin = this.pinMapper.selectByUserEmailAndId(user.getEmail(), pin.getId());
        if (existingPin != null) {
            return CommonResult.FAILURE_DUPLICATE;
        }

        pin.setUserEmail(user.getEmail());
        pin.setTitle(dbPin.getTitle());
        pin.setContent(dbPin.getContent());
        pin.setLink(dbPin.getLink());
        pin.setTag(dbPin.getTag());
        pin.setImage(dbPin.getImage());
        pin.setCreatedAt(LocalDateTime.now());
        pin.setModifiedAt(LocalDateTime.now());
        pin.setDeleted(false);

        return this.pinMapper.insert(pin) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
