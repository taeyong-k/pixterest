package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.CommentEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommentMapper {
    int update(@Param(value = "comment") CommentEntity comment);

    int insert(@Param(value = "comment") CommentEntity comment);

    CommentEntity[] selectAllByPinId(@Param(value = "pinId") int pinId);
}
