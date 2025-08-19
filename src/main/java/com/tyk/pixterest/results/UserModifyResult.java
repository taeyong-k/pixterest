package com.tyk.pixterest.results;

public enum UserModifyResult implements Result{
    // 세션/권한
    FAILURE_SESSION_EXPIRED,        // 세션이 만료되었거나 사용자 상태가 유효하지 않음
    FAILURE_NO_PERMISSION,          // 권한 없음

    // 입력 검증
    FAILURE_INVALID_EMAIL,          // 잘못된 이메일 형식

    // 대상 유저 상태 관련
    FAILURE_USER_NOT_FOUND,         // 유저를 찾을 수 없음
    FAILURE_USER_ALREADY_DELETED,   // 이미 삭제된 유저
    FAILURE_USER_ALREADY_SUSPENDED, // 이미 정지된 유저

    // DB / 시스템 관련
    FAILURE_DB_UPDATE,              // DB 갱신 실패;
}
