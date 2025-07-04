package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.services.CreationService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

@Controller
@RequestMapping(value = "/creation")
public class CreationController {
    private final CreationService creationService;

    @Autowired
    public CreationController(CreationService creationService) {
        this.creationService = creationService;
    }

    @RequestMapping(value = "/pin", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getPin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                         Model model) {
        if (signedUser == null || signedUser.isSuspended() || signedUser.isDeleted()) {
            model.addAttribute("loginCheck", "접근 권한이 없습니다. 로그인 후 이용해주세요.");
            System.out.println("로그인 안됨!");
            return "redirect:/user/login";
        }
        return "creation/pin";
    }

    @RequestMapping(value = "/pin", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                          PinEntity pin) {
        if (signedUser == null || signedUser.isSuspended() || signedUser.isDeleted()) {
            JSONObject error = new JSONObject();
            error.put("result", "failure_login");
            return error.toString();
        }
        Result result = creationService.creationPin(signedUser, pin);
        JSONObject response = new JSONObject();
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }
}
