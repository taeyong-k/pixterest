package com.tyk.pixterest.utils;

public class FileStorageUtil {
    private static final String BASE_DIR = "/var/www/uploads"; // 운영 서버 절대경로

    public static String getPinUploadDir() {
        return BASE_DIR + "/pins";
    }
}