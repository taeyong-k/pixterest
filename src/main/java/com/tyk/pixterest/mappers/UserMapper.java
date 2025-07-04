package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int insert (@Param(value = "user") UserEntity user);

    UserEntity selectByEmail(@Param(value = "email") String email);
}
