package com.tyk.pixterest.results;

public enum CommonResult implements Result {
    FAILURE,
    FAILURE_ABSENT,
    FAILURE_DUPLICATE,
    FAILURE_SESSION_EXPIRED,
    SUCCESS
}
