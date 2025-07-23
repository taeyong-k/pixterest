package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.CommentEntity;
import com.tyk.pixterest.vos.CommentVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommentMapper {
    int insert(@Param(value = "comment") CommentEntity comment);

    int updateContent(@Param("comment") CommentEntity comment);

    int updateDeleted(@Param("comment") CommentEntity comment);

    CommentEntity selectById(@Param(value = "id") int id);

    CommentVo[] selectAllByPinId(@Param(value = "pinId") int pinId);
}
