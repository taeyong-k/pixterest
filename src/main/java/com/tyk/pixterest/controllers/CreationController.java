package com.tyk.pixterest.controllers;

import com.tyk.pixterest.services.CreationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value = "/creation")
public class CreationController {
    private final CreationService creationService;

    @Autowired
    public CreationController(CreationService creationService) {
        this.creationService = creationService;
    }

    @RequestMapping(value = "/pin", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getPinTool() {
        return "creation/pin";
    }
}
