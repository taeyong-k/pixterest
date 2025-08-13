package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.CommentEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.CommentMapper;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.vos.CommentVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CommentService {
    private final PinMapper pinMapper;
    private final CommentMapper commentMapper;

    @Autowired
    public CommentService(PinMapper pinMapper, CommentMapper commentMapper) {
        this.pinMapper = pinMapper;
        this.commentMapper = commentMapper;
    }

    public static boolean isContentValid(String input) {
        return input != null && input.matches("^(.{1,1000})$");
    }

    public ResultTuple<CommentVo[]> getCommentsByPinId(int pinId) {
        if (pinId < 1) {
            return ResultTuple.<CommentVo[]>builder()
                    .result(CommonResult.FAILURE_INVALID)
                    .build();
        }
        PinEntity dbPin = this.pinMapper.selectById(pinId);
        if (dbPin == null || dbPin.isDeleted()) {
            return ResultTuple.<CommentVo[]>builder()
                    .result(CommonResult.FAILURE_ABSENT)
                    .build();
        }
        return ResultTuple.<CommentVo[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(this.commentMapper.selectAllByPinId(pinId))
                .build();
    }

    public Result write(UserEntity user, CommentEntity comment) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        if (user.isSuspended() || user.isDeleted()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }

        if (comment == null ||
                comment.isDeleted() ||
                !CommentService.isContentValid(comment.getContent())) {
            return CommonResult.FAILURE_INVALID;
        }
        comment.setUserEmail(user.getEmail());
        comment.setNickname(user.getNickname());
        comment.setContent(comment.getContent());
        if (comment.getCommentId() != null && comment.getCommentId() < 1) {
            comment.setCommentId(null);
        }
        comment.setCreatedAt(LocalDateTime.now());
        comment.setModifiedAt(LocalDateTime.now());
        comment.setDeleted(false);

        return this.commentMapper.insert(comment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result modify(UserEntity user, CommentEntity comment) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (user.isSuspended() || user.isDeleted()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }
        if (comment == null ||
                comment.getId() < 1 ||
                comment.getContent() == null ||
                comment.getContent().isEmpty()) {
            return CommonResult.FAILURE_ABSENT;
        }
        CommentEntity dbComment = this.commentMapper.selectById(comment.getId());
        if (dbComment == null || dbComment.isDeleted()) {
            return CommonResult.FAILURE_ABSENT;
        }
        if (!user.getEmail().equals(dbComment.getUserEmail()) && !user.isAdmin()) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        dbComment.setContent(comment.getContent());
        dbComment.setModifiedAt(LocalDateTime.now());
        return this.commentMapper.updateContent(dbComment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }

    public Result delete(UserEntity user, CommentEntity comment) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }

        if (user.isSuspended() || user.isDeleted()) {
            return CommonResult.FAILURE_FORBIDDEN;
        }

        if (comment == null || comment.isDeleted()) {
            return CommonResult.FAILURE_ABSENT;
        }

        comment.setDeleted(true);
        return this.commentMapper.updateDeleted(comment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
