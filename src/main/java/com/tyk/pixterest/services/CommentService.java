package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.CommentEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.mappers.CommentMapper;
import com.tyk.pixterest.mappers.DetailMapper;
import com.tyk.pixterest.mappers.PinMapper;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CommentService {
    private final PinMapper pinMapper;
    private final DetailMapper detailMapper;
    private final CommentMapper commentMapper;

    @Autowired
    public CommentService(PinMapper pinMapper, DetailMapper detailMapper, CommentMapper commentMapper) {
        this.pinMapper = pinMapper;
        this.detailMapper = detailMapper;
        this.commentMapper = commentMapper;
    }

    public static boolean isContentValid(String input) {
        return input != null && input.matches("^(.{1,1000})$");
    }

    public ResultTuple<CommentEntity[]> getCommentsByPinId(int pinId) {
        if (pinId < 1) {
            return ResultTuple.<CommentEntity[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        PinEntity dbPin = this.pinMapper.selectById(pinId);
        if (dbPin == null || dbPin.isDeleted()) {
            return ResultTuple.<CommentEntity[]>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }
        return ResultTuple.<CommentEntity[]>builder()
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
            return CommonResult.FAILURE;
        }
        comment.setUserEmail(user.getEmail());
        comment.setContent(comment.getContent());
        if (comment.getCommentId() != null && comment.getCommentId() < 1) {
            comment.setCommentId(null);
        }
        comment.setCreatedAt(LocalDateTime.now());
        comment.setDeleted(false);
        return this.commentMapper.insert(comment) > 0
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
            return CommonResult.FAILURE;
        }
        comment.setDeleted(true);
        return this.commentMapper.update(comment) > 0
                ? CommonResult.SUCCESS
                : CommonResult.FAILURE;
    }
}
