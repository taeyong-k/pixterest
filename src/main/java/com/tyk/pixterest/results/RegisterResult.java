package com.tyk.pixterest.results;

public enum RegisterResult implements Result {
    FAILURE_NULL_USER,          // 유저 정보 값 없음
    FAILURE_MISSING_FIELDS,     // 입력 값 없음
    FAILURE_INVALID_EMAIL,      // 유효하지 않은 이메일
    FAILURE_INVALID_PASSWORD,   // 유효하지 않은 비밀번호
    FAILURE_DUPLICATE_EMAIL,    // 중복된 이메일 입력
    FAILURE_INVALID_BIRTH      // 잘못된 생년월일
}
