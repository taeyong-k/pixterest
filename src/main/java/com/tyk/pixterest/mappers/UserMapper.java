package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    int insert (@Param(value = "user") UserEntity user);

    int update (@Param(value = "user") UserEntity user);

    int delete (@Param(value = "email") String email);

    UserEntity selectByEmail(@Param(value = "email") String email);

    UserEntity selectByPassword(@Param(value = "password") String password);

    List<BoardEntity> selectBoardsByEmail(@Param(value = "email") String email);

    List<PinEntity> selectPinsByEmail(@Param(value = "email") String email);

    List<PinEntity> selectSavedPinsByEmail(@Param(value = "email") String email);
}
