package com.tyk.pixterest.mappers;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.vos.SearchVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PinMapper {
    int insert(@Param(value = "pin") PinEntity pin);

    PinEntity selectById(@Param(value = "id") int id);

    PinEntity selectByUserEmailAndId(@Param("userEmail") String userEmail,
                                     @Param("id") int id);

    PinEntity[] search(@Param(value = "searchVo") SearchVo searchVo);

    PinEntity[] selectAll();

}
