package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.PinEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DetailMapper {
    PinEntity selectById(@Param(value = "id") Long id);
}
