package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.BoardMapper;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.CreationResult;
import com.tyk.pixterest.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CreationService {
    private final PinMapper pinMapper;
    private final BoardMapper boardMapper;

    @Autowired
    public CreationService(PinMapper pinMapper, BoardMapper boardMapper) {
        this.pinMapper = pinMapper;
        this.boardMapper = boardMapper;
    }

    public static boolean isTitleValid(String input) {
        return input != null && input.matches("^(.{0,100})$");
    }

    public static boolean isContentValid(String input) {
        return input != null && input.matches("^(.{0,800})$");
    }

    public static boolean isUrlValid(String input) {
        return input == null || input.isEmpty() || input.matches("^(https?)://([a-z0-9-]+\\.)+[a-z0-9]{2,}(/.*)?$");
    }

    public static boolean isNameValid(String input) {
        return input != null && input.matches("^(.{1,50})$");
    }

    // 새 핀 생성 메서드
    public Result creationPin(UserEntity user, PinEntity pin) {
        //1. 로그인 및 유저 상태 체크
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (user.isDeleted() || user.isSuspended()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }

        // 2. 유효성 검사
        if (pin == null ||
                !CreationService.isTitleValid(pin.getTitle()) ||
                !CreationService.isContentValid(pin.getContent()) ||
                !CreationService.isUrlValid(pin.getLink())) {
            return CreationResult.FAILURE_INVALID;
        }


        // 이미지파일검사


        // (선택한) 보드 존재 유무
        if (pin.getBoardId() != null) {
            BoardEntity dbBoard = this.boardMapper.selectById(pin.getBoardId());

            if (dbBoard == null || dbBoard.isDeleted()) {
                return CreationResult.FAILURE_BOARD_ABSENT;
            }

            if (!dbBoard.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
                return CreationResult.FAILURE_BOARD_FORBIDDEN;
            }
        }

        // 3. 핀 데이터 세팅
        pin.setUserEmail(user.getEmail());
        pin.setTitle(pin.getTitle());
        pin.setContent(pin.getContent());
        pin.setLink(pin.getLink());
        pin.setTag(pin.getTag());
//        pin.setImage(pin.getImage());
        pin.setImage("default.png");    // ★임시!!★
        pin.setCreatedAt(LocalDateTime.now());
        pin.setModifiedAt(LocalDateTime.now());
        pin.setDeleted(false);

        // 4. DB 저장
        return this.pinMapper.insert(pin) > 0
                ? CreationResult.SUCCESS
                : CreationResult.FAILURE;
    }

    // 보드 생성 메서드
    public Result creationBoard(UserEntity user, BoardEntity board) {
        //1. 로그인 및 유저 상태 체크
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (user.isDeleted() || user.isSuspended()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }

        // 2. 입력값 유효성 검사
        if (board == null ||
                !CreationService.isNameValid(board.getName())) {
            return CreationResult.FAILURE_INVALID;
        }

        // 3. 보드 이름 중복 검사
        BoardEntity dbBoard = this.boardMapper.selectByUserEmailAndName(user.getEmail(), board.getName());
        if (dbBoard != null && !dbBoard.isDeleted()) {
            return CreationResult.FAILURE_DUPLICATE;
        }

        if (dbBoard != null) {
            if (!dbBoard.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
                return CommonResult.FAILURE_FORBIDDEN;
            }
        }

        // 4. 보드 데이터 세팅
        board.setUserEmail(user.getEmail());
        board.setName(board.getName());
        board.setCreatedAt(LocalDateTime.now());
        board.setModifiedAt(LocalDateTime.now());
        board.setDeleted(false);

        // 5. DB 저장
        return this.boardMapper.insert(board) > 0
                ? CreationResult.SUCCESS
                : CreationResult.FAILURE;
    }
}
