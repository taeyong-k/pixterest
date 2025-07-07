package com.tyk.pixterest.results;

public enum CreationResult implements Result {
    FAILURE,                    // 실패
    FAILURE_INVALID,            // 유효성 검사 실패
    FAILURE_NO_IMAGE,           // 이미지 저장 실패 (없음)
    FAILURE_BOARD_ABSENT,       // 선택한 보드가 없음
    FAILURE_BOARD_FORBIDDEN,    // 선택한 보드 접근 불가
    SUCCESS                     // 성공
}
