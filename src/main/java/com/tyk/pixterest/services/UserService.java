package com.tyk.pixterest.services;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.UserMapper;
import com.tyk.pixterest.results.*;
import com.tyk.pixterest.utils.CryptoUtils;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService
{
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public static boolean isEmailValid(String input)
    {
        return input != null && input.matches("^(?=.{8,50}$)([\\da-z\\-_.]{4,})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2,3})?$");
    }

    public static boolean isPasswordValid(String input)
    {
        return input != null && input.matches("^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]}\\\\|;:'\",<.>/?]{8,50})$");
    }

    public static boolean isBirthValid(String input)
    {
        return input != null && input.matches("^(19[0-9]{2}|20[0-2][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$");
    }

    public Result register(UserEntity user)
    {
        // 1. 유저 객체 자체가 없는 경우
        if (user == null) {
            return RegisterResult.FAILURE_NULL_USER;
        }

        // 2. 필수 입력값 누락
        if (user.getEmail() == null || user.getEmail().trim().isEmpty() ||
                user.getPassword() == null || user.getPassword().trim().isEmpty() ||
                user.getBirth() == null || user.getBirth().toString().trim().isEmpty()) {
            return RegisterResult.FAILURE_MISSING_FIELDS;
        }

        // 3. 이메일 형식 검증
        if (!isEmailValid(user.getEmail())) {
            return RegisterResult.FAILURE_INVALID_EMAIL;
        }

        // 4. 비밀번호 형식 검증
        if (!isPasswordValid(user.getPassword())) {
            return RegisterResult.FAILURE_INVALID_PASSWORD;
        }

        // 5. 생년월일 유효성 검증
        if (!isBirthValid(user.getBirth().toString())) {
            return RegisterResult.FAILURE_INVALID_BIRTH;
        }

        // 6. 이메일 중복 체크
        UserEntity dbUser = this.userMapper.selectByEmail(user.getEmail());
        if (dbUser != null) {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }

        // 7. 기본 정보 세팅
        String emailId = user.getEmail().split("@")[0];

        user.setEmail(user.getEmail().trim());
        user.setPassword(CryptoUtils.hashSha512(user.getPassword()));
        user.setName(emailId);
        user.setNickname(emailId);
        user.setFollowers(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setModifiedAt(LocalDateTime.now());
        user.setDeleted(false);
        user.setSuspended(false);
        user.setAdmin(false);

        // 8. DB 저장 결과 반환
        return this.userMapper.insert(user) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }


    public ResultTuple<UserEntity> Login(String email, String password)
    {
        if (!UserService.isEmailValid(email))
        {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE_INVALID_EMAIL)
                    .build();
        }
        if (!UserService.isPasswordValid(password))
        {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE_INVALID_PASSWORD)
                    .build();
        }
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended())
        {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE_FORBIDDEN)
                    .build();
        }
        String hashedPassword = CryptoUtils.hashSha512(password);
        if (!dbUser.getPassword().equals(hashedPassword))
        {
            return ResultTuple.<UserEntity>builder()
                    .result(LoginResult.FAILURE_WRONG_PASSWORD)
                    .build();
        }
        return ResultTuple.<UserEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbUser)
                .build();
    }

    public CommonResult logout(UserEntity signedUser, HttpSession session)
    {
        if (session == null || session.getAttribute("signedUser") == null) {
            return CommonResult.FAILURE;
        }

        // 세션에서 현재 로그인된 사용자 정보
        UserEntity sessionUser = (UserEntity) session.getAttribute("signedUser");

        // ✅ 전달된 signedUser와 세션 유저 정보 비교
        if (!sessionUser.getEmail().equals(signedUser.getEmail())) {
            // 다른 사용자가 세션을 악용하려는 시도
            return CommonResult.FAILURE;
        }

        // ✅ DB에서 사용자 최신 정보 확인
        UserEntity dbUser = this.userMapper.selectByEmail(sessionUser.getEmail());
        if (dbUser == null || !dbUser.getEmail().equals(sessionUser.getEmail())) {
            // DB에 사용자 없음 or 세션 정보 불일치
            return CommonResult.FAILURE;
        }

        // ✅ 모든 검증 통과 → 세션 무효화
        session.invalidate();
        return CommonResult.SUCCESS;
    }

    public Result changePassword(UserEntity signedUser , String password, String newPassword)
    {
        // 기존 비밀번호 체크
        if (!UserService.isPasswordValid(password)) {
            return ChangePasswordResult.CURRENT_PASSWORD_INVALID;
        }

        // 새 비밀번호 체크
        if (!UserService.isPasswordValid(newPassword)) {
            return ChangePasswordResult.NEW_PASSWORD_INVALID;
        }

        // 기존 비밀번호와 새 비밀번호 동일 여부
        if (password.equals(newPassword)) {
            return ChangePasswordResult.PASSWORD_SAME;
        }

        // DB 조회
        String hashedPassword = CryptoUtils.hashSha512(password);
        UserEntity dbUser = this.userMapper.selectByEmailAndPassword(signedUser.getEmail(), hashedPassword);
        if (dbUser == null || dbUser.isDeleted() || dbUser.isSuspended()) {
            return ChangePasswordResult.USER_NOT_FOUND;
        }

        // 기존 비밀번호와 DB 비밀번호 비교
        if (!dbUser.getPassword().equals(hashedPassword)) {
            return ChangePasswordResult.CURRENT_PASSWORD_MISMATCH;
        }

        // 새 비밀번호 업데이트
        dbUser.setPassword(CryptoUtils.hashSha512(newPassword));
        boolean updated = this.userMapper.update(dbUser) > 0;
        return updated ? CommonResult.SUCCESS : ChangePasswordResult.UPDATE_FAILED;
    }

    public Result deleteUser(UserEntity signedUser, String email)
    {
        // 로그인한 사용자 세션 / 상태 확인
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        // 권한 확인
        if (!signedUser.isAdmin() && !signedUser.getEmail().equals(email)) {
            return UserModifyResult.FAILURE_NO_PERMISSION;
        }

        // 대상 유저 조회
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null) {
            return UserModifyResult.FAILURE_USER_NOT_FOUND;
        }
        if (dbUser.isDeleted()) {
            return UserModifyResult.FAILURE_USER_ALREADY_DELETED;
        }
        if (dbUser.isSuspended()) {
            return UserModifyResult.FAILURE_USER_ALREADY_SUSPENDED;
        }

        // 삭제 처리
        dbUser.setDeleted(true);
        return this.userMapper.update(dbUser) > 0
                ? CommonResult.SUCCESS
                : UserModifyResult.FAILURE_DB_UPDATE;
    }

    public Result deactivateUser(UserEntity signedUser, String email)
    {
        // 로그인한 사용자 세션 / 상태 확인
        if (signedUser == null || signedUser.isDeleted() || signedUser.isSuspended()) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        // 권한 확인
        if (!signedUser.isAdmin() && !signedUser.getEmail().equals(email)) {
            return UserModifyResult.FAILURE_NO_PERMISSION;
        }

        // 이메일 형식 검증
        if (!UserService.isEmailValid(email)) {
            return UserModifyResult.FAILURE_INVALID_EMAIL;
        }

        // 대상 유저 조회
        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null) {
            return UserModifyResult.FAILURE_USER_NOT_FOUND;
        }
        if (dbUser.isDeleted()) {
            return UserModifyResult.FAILURE_USER_ALREADY_DELETED;
        }
        if (dbUser.isSuspended()) {
            return UserModifyResult.FAILURE_USER_ALREADY_SUSPENDED;
        }

        // 비활성화 처리
        dbUser.setDeleted(true);
        return this.userMapper.update(dbUser) > 0
                ? CommonResult.SUCCESS
                : UserModifyResult.FAILURE_DB_UPDATE;
    }

    public ResultTuple<String> getTheme(UserEntity signedUser, String theme)
    {
        if (signedUser == null)
        {
            return ResultTuple.<String>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        if (theme == null)
        {
            return ResultTuple.<String>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }

        return null;
    }

    public CommonResult saveUserTheme(UserEntity signedUser, String theme)
    {
        return null;
    }
}
