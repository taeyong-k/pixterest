package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.PinUserSaveEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.BoardMapper;
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
    private final BoardMapper boardMapper;

    @Autowired
    public PinService(PinMapper pinMapper, PinUserSaveMapper pinUserSaveMapper, DetailMapper detailMapper, BoardMapper boardMapper) {
        this.pinMapper = pinMapper;
        this.pinUserSaveMapper = pinUserSaveMapper;
        this.detailMapper = detailMapper;
        this.boardMapper = boardMapper;
    }

    public PinEntity getPinById(Long pinId) {
        if (pinId == null || pinId < 1) {
            return null;
        }
        return this.detailMapper.selectById(pinId);
    }

    public boolean isPinSavedByUser(UserEntity user, int pinId) {
        PinUserSaveEntity save = this.pinUserSaveMapper.selectByUserEmailAndPinId(user.getEmail(), pinId);
        if (save == null) {
            return false;
        }
        return true;
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

    public Result hidePin(UserEntity user, int pinId) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (user.isSuspended() || user.isDeleted()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }
        if (pinId < 1) {
            return CommonResult.FAILURE_ABSENT;
        }

        PinEntity dbPin = this.pinMapper.selectById(pinId);
        if (dbPin == null) {
            return CommonResult.FAILURE_ABSENT;
        }

        dbPin.setDeleted(true);

        if (this.pinMapper.updateDelete(dbPin) < 1) {
            return CommonResult.FAILURE;
        }

        // 보드 대표 이미지 갱신
        if (dbPin.getBoardId() != null) {
            BoardEntity board = boardMapper.selectById(dbPin.getBoardId());
            if (board != null) {
                if (board.getCoverImage() != null && board.getCoverImage().equals(dbPin.getImage())) {
                    PinEntity anotherPin = this.pinMapper.selectFirstNonDeletedPinByBoardId(dbPin.getBoardId());
                    String newCoverImage = (anotherPin != null) ? anotherPin.getImage() : null;
                    this.boardMapper.updateCoverImage(dbPin.getBoardId(), newCoverImage);
                }
            }
        }

        return this.pinMapper.updateDelete(dbPin) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result writePin(UserEntity user, int pinId, String title, String content, String link, String tag, Integer boardId) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (user.isSuspended() || user.isDeleted()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }
        if (pinId < 1) {
            return CommonResult.FAILURE_ABSENT;
        }

        PinEntity dbPin = this.pinMapper.selectById(pinId);
        if (dbPin == null) {
            return CommonResult.FAILURE_ABSENT;
        }

        Integer oldBoardId = dbPin.getBoardId();    // 기존 보드 ID 저장

        dbPin.setTitle(title);
        dbPin.setContent(content);
        dbPin.setLink(link);
        dbPin.setTag(tag);
        dbPin.setBoardId(boardId);

        boolean updated = this.pinMapper.update(dbPin) > 0;
        if (!updated) return CommonResult.FAILURE;

        // 보드 대표 이미지 갱신
        if (oldBoardId != null && !oldBoardId.equals(boardId)) {
            BoardEntity oldBoard = boardMapper.selectById(oldBoardId);
            if (oldBoard != null) {
                if (oldBoard.getCoverImage() != null && oldBoard.getCoverImage().equals(dbPin.getImage())) {
                    PinEntity newCover = this.pinMapper.selectFirstNonDeletedPinByBoardId(oldBoardId);
                    String newCoverImage = (newCover != null) ? newCover.getImage() : null;
                    this.boardMapper.updateCoverImage(oldBoardId, newCoverImage);
                }
            }
            // 새 보드의 대표 이미지가 비어 있다면 이 핀으로 설정
            BoardEntity newBoard = boardMapper.selectById(boardId);
            if (newBoard != null && (newBoard.getCoverImage() == null || newBoard.getCoverImage().isBlank())) {
                boardMapper.updateCoverImage(boardId, dbPin.getImage());
            }
        }

        return CommonResult.SUCCESS;
    }
}
