package com.tyk.pixterest.results;

public enum ChangePasswordResult implements Result{
    CURRENT_PASSWORD_INVALID,   // 기존 비밀번호가 null이거나 형식 불일치
    NEW_PASSWORD_INVALID,       // 새 비밀번호가 null이거나 형식 불일치
    PASSWORD_SAME,              // 기존 비밀번호와 동일
    CURRENT_PASSWORD_MISMATCH,  // DB에 저장된 기존 비밀번호와 불일치
    USER_NOT_FOUND,             // DB 조회 실패 / 삭제 / 정지
    UPDATE_FAILED               // DB 업데이트 실패
}

