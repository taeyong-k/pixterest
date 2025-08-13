package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.PinUserSaveEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PinUserSaveMapper {
    PinUserSaveEntity selectByUserEmailAndPinId(@Param(value = "userEmail") String userEmail,
                                                @Param(value = "pinId") int pinId);

    int insert(@Param(value = "save") PinUserSaveEntity saveEntity);

    List<Integer> selectPinIdsByUserEmail(@Param(value = "userEmail") String userEmail);
}
