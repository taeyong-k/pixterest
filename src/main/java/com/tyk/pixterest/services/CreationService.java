package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.BoardMapper;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.CreationResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.utils.FileStorageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

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
    public Result creationPin(UserEntity user, PinEntity pin, MultipartFile imageFile) {
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

        // 3. 이미지파일검사
        // 3-1. 이미지 존재 확인
        if (imageFile == null || imageFile.isEmpty()) {
            return CreationResult.FAILURE_NO_IMAGE;
        }
        // 3-2. 파일 크기 체크 (최대: 50MB)
        if (imageFile.getSize() > 50 * 1024 * 1024) {
            return CreationResult.FAILURE_TOO_LARGE;
        }
        // 3-3. 파일 타입 체크
        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return CreationResult.FAILURE_NOT_IMAGE_FILE;
        }

        // 4. (선택한) 보드 존재 유무
        if (pin.getBoardId() != null) {
            BoardEntity dbBoard = this.boardMapper.selectById(pin.getBoardId());

            if (dbBoard == null || dbBoard.isDeleted()) {
                return CreationResult.FAILURE_BOARD_ABSENT;
            }

            if (!dbBoard.getUserEmail().equals(user.getEmail()) && !user.isAdmin()) {
                return CreationResult.FAILURE_BOARD_FORBIDDEN;
            }
        }

        // 5-1. 이미지 저장
        try {
            String uploadDir = "C:/pixterest/uploads/";

            String filename = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

            Path filePath = Paths.get(uploadDir + filename);
            Files.createDirectories(filePath.getParent());
            imageFile.transferTo(filePath.toFile());

            pin.setImage(filename);
        } catch (IOException e) {
            e.printStackTrace();
            return CreationResult.FAILURE;
        }

        // 5-2. 핀 데이터 세팅
        pin.setUserEmail(user.getEmail());
        pin.setTitle(pin.getTitle());
        pin.setContent(pin.getContent());
        pin.setLink(pin.getLink());
        pin.setTag(pin.getTag());
        pin.setCreatedAt(LocalDateTime.now());
        pin.setModifiedAt(LocalDateTime.now());
        pin.setDeleted(false);

        // 6. DB 저장
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

    // 보드 데이터 가져오기
    public ResultTuple<BoardEntity[]> getByBoards (UserEntity user) {
        if (user == null) {
            return ResultTuple.<BoardEntity[]>builder()
                    .result(CommonResult.FAILURE_SESSION_EXPIRED)
                    .build();
        }

        if (user.isDeleted() || user.isSuspended()) {
            return ResultTuple.<BoardEntity[]>builder()
                    .result(CommonResult.FAILURE_FORBIDDEN)
                    .build();
        }

        BoardEntity[] dbBoard = this.boardMapper.selectByUserEmail(user.getEmail());
        if (dbBoard == null || dbBoard.length == 0) {
            return ResultTuple.<BoardEntity[]>builder()
                    .result(CreationResult.FAILURE_BOARD_ABSENT)
                    .build();
        }

        return ResultTuple.<BoardEntity[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbBoard)
                .build();
    }
}
