package com.tyk.pixterest.services;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.mappers.PinMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HomeService {
    private final PinMapper pinMapper;

    @Autowired
    public HomeService(PinMapper pinMapper) {
        this.pinMapper = pinMapper;
    }

    public PinEntity[] getHomePinsAll() {
        return this.pinMapper.selectAll();
    }
}
