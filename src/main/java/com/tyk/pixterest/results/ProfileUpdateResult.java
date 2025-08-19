package com.tyk.pixterest.results;

public enum ProfileUpdateResult implements Result{
    FAILURE_USER_NOT_FOUND,     // DB 유저 없음/삭제/정지
    FAILURE_USER_MISMATCH,      // 세션 유저와 DB 유저 불일치
    INVALID_NAME,               // 이름 유효하지 않음
    INVALID_NICKNAME,           // 사용자 이름 유효하지 않음
    INVALID_SITE,               // 웹사이트 유효하지 않음
    INVALID_INTRODUCE,          // 소개 유효하지 않음
    INVALID_BIRTH,              // 생일 유효하지 않음
    DB_UPDATE_FAILED            // DB 업데이트 실패
}
