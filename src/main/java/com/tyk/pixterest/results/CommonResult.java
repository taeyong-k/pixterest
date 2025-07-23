package com.tyk.pixterest.results;

public enum CommonResult implements Result {
    FAILURE,
    FAILURE_ABSENT,             // 데이터 없음
    FAILURE_DUPLICATE,          // 중복
    FAILURE_INVALID,            // 유효하지않음
    FAILURE_SESSION_EXPIRED,    // 로그인 안 했거나 세션 만료
    FAILURE_FORBIDDEN,          // 권한 없음
    SUCCESS
}
