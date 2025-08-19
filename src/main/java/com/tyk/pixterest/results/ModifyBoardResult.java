package com.tyk.pixterest.results;

public enum ModifyBoardResult implements Result {
    FAILURE_SESSION_EXPIRED, // 세션 만료 및 사용자 유효 X
    FAILURE_NOT_FOUND, // 존재 게시판 없음
    FAILURE_DELETED, // 삭제된 게시판
    FAILURE_PRIVATE, // 비공개 게시판 or 접근 제한 게시판
    FAILURE_NO_PERMISSION // 접근 권한 X
}