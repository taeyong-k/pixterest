package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping(value = "/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegister(
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "birth", required = false) String birth,
            @RequestParam(value = "profileColor", required = false) String profileColor
    ) {
        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setPassword(password);
        if (birth != null && !birth.isBlank()) {
            user.setBirth(LocalDate.parse(birth));
        }
        user.setProfileColor(profileColor);

        Result result = this.userService.register(user);

        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
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

    @RequestMapping(value = "/logout", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postLogout(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             HttpSession session)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        CommonResult result = this.userService.logout(signedUser, session);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/recover-password", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getRecoverPassword()
    {
        return "user/recover";
    }


    @RequestMapping(value = "/theme", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getTheme(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           @RequestParam(value = "theme", required = false) String theme)
    {
        JSONObject response = new JSONObject();

        if (signedUser == null)
        {
            response.put("theme", "light");  // 로그인 안 되어 있으면 기본값
            return response.toString();
        }

        // DB에서 사용자 테마 조회 (예: userService.getThemeByUserId)
//        String theme = userService.getThemeByUserId(signedUser.getId());

        if (theme == null) theme = "light";

        response.put("theme", theme);
        return response.toString();
    }

    @RequestMapping(value = "/theme", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postTheme(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @RequestParam(value = "theme", required = false) String theme)
    {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "fail");
            response.put("message", "로그인이 필요합니다.");
            return response.toString();
        }

        // DB에 사용자 테마 저장
//        boolean success = userService.saveUserTheme(signedUser.getId(), theme);

//        response.put("result", success ? "success" : "fail");
        return response.toString();
    }

    @RequestMapping(value = "/password", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPassword(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                               String password,
                               String newPassword)
    {

        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        Result result = this.userService.changePassword(signedUser,password, newPassword);
        JSONObject response = new JSONObject();
        response.put("result",result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/deactivate", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postDeactivate(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                 String email, HttpSession session)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        Result result = this.userService.deactivateUser(signedUser, email);
        session.invalidate();
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postDelete(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             String email, HttpSession session)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        Result result = this.userService.deleteUser(signedUser, email);
        session.invalidate();
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
