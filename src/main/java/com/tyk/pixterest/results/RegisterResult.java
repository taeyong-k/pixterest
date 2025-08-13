package com.tyk.pixterest.results;

public enum RegisterResult implements Result {
    FAILURE_DUPLICATE_EMAIL,
    FAILURE_DUPLICATE_NICKNAME,
    FAILURE_DUPLICATE_CONTACT
}
