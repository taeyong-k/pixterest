package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogin()
    {
        return "user/login";
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postLogin(@RequestParam(value = "email") String email,
                            @RequestParam(value = "password") String password,
                            HttpServletRequest request)
    {
        ResultTuple<UserEntity> result = this.userService.Login(email, password);
        if (result.getResult() == CommonResult.SUCCESS)
        {
            request.getSession().setAttribute("signedUser", result.getPayload());
        }
        JSONObject response = new JSONObject();
        response.put("result",result.getResult().toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegister(UserEntity user)
    {
        Result result = this.userService.register(user);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/recover-password", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getRecoverPassword()
    {
        return "user/recover";
    }






}
