package com.tyk.pixterest.results;

public enum CreationResult implements Result {
    TEMP,// 임시!(삭제 바람)
    FAILURE,            // 실패
    FAILURE_LOGIN,      // 비_로그인
    FAILURE_ABSENT,     // 없음
    FAILURE_INVALID,    // 유효성 검사 실패
    FAILURE_NO_IMAGE,   // 이미지 저장 실패 (없음)
    SUCCESS             // 성공
}
