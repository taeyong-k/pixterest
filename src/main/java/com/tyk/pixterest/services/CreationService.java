package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.results.CreationResult;
import com.tyk.pixterest.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CreationService {
    private final PinMapper pinMapper;

    @Autowired
    public CreationService(PinMapper pinMapper) {
        this.pinMapper = pinMapper;
    }

    public static boolean isTitleValid(String input) {
        return input != null && input.matches("^(.{1,100})$");
    }

    public static boolean isContentValid(String input) {
        return input != null && input.matches("^(.{1,800})$");
    }

    public static boolean isUrlValid(String input) {
        return input != null && input.matches("^(https?)://([a-z0-9-]+\\.)+[a-z0-9]{2,}(/.*)?$");
    }

    public Result creationPin(UserEntity user, PinEntity pin) {
        if (user == null || user.isDeleted() || user.isSuspended()) {
            return CreationResult.TEMP; // ★나중에 userResult로 변경★
        }

        if (pin == null ||
                !CreationService.isTitleValid(pin.getTitle()) ||
                !CreationService.isContentValid(pin.getContent()) ||
                !CreationService.isUrlValid(pin.getLink())) {
            return CreationResult.FAILURE_INVALID;
        }

        PinEntity dbPin = this.pinMapper.selectById(pin.getId());

        if (dbPin == null || dbPin.isDeleted()) {
            return CreationResult.FAILURE_ABSENT;
        }

        if (!dbPin.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
            return CreationResult.TEMP; // ★나중에 userResult로 변경★
        }

        pin.setUserEmail(user.getEmail());
        pin.setTitle(pin.getTitle());
        pin.setContent(pin.getContent());
        pin.setLink(pin.getLink());
        pin.setTag(pin.getTag());
        pin.setImage(pin.getImage());
        pin.setCreatedAt(LocalDateTime.now());
        pin.setModifiedAt(null);
        pin.setDeleted(false);

        return this.pinMapper.insert(pin) > 0
                ? CreationResult.SUCCESS
                : CreationResult.FAILURE;
    }
}
