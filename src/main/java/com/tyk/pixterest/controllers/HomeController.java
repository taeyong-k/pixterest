package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.services.HomeService;
import com.tyk.pixterest.vos.SearchVo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@Controller
@RequestMapping(value = "/")
public class HomeController {
    private final HomeService homeService;

    @Autowired
    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getHome(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                          SearchVo searchVo,
                          Model model) {
        PinEntity[] result;

        if (searchVo != null && searchVo.getKeyword() != null && !searchVo.getKeyword().isEmpty()) {
            result = this.homeService.getBySearch(searchVo);
        } else {
            result = this.homeService.getHomePinsAll();
        }

        Set<Integer> savedPinIds = new HashSet<>();
        if (signedUser != null) {
             savedPinIds = homeService.getSavedPinIdsByUser(signedUser);
        }

        model.addAttribute("pins", result);
        model.addAttribute("savedPinIds", savedPinIds);
        model.addAttribute("keyword", searchVo != null ? searchVo.getKeyword() : "");

        return "home/index";
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postHome(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           PinEntity pin) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }
        Result result = this.homeService.savePin(signedUser, pin);
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }


}
