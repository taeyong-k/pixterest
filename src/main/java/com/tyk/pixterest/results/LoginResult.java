package com.tyk.pixterest.results;

public enum LoginResult implements Result{
    FAILURE_INVALID_EMAIL,      // 유효하지 않은 이메일
    FAILURE_INVALID_PASSWORD,   // 유효하지 않은 비밀번호
    FAILURE_WRONG_PASSWORD,     // 잘못된 비밀번호
    FAILURE_FORBIDDEN           // 계정이 삭제 및 정지됨
}
