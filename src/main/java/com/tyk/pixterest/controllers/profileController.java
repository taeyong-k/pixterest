package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.services.ProfileService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/user")
public class profileController {

    private final ProfileService profileService;

    @Autowired
    public profileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @RequestMapping(value = "/info", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getProfile(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser)
    {
        ResultTuple<UserEntity> result = this.profileService.getInfo(signedUser);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().toStringLower());

        if (result.getResult() == CommonResult.SUCCESS)
        {
            UserEntity user = result.getPayload();
            JSONObject userInfo = new JSONObject();

            userInfo.put("email",user.getEmail());
            userInfo.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
            userInfo.put("name",user.getName());
            userInfo.put("nickname",user.getNickname());
            userInfo.put("site", user.getSite());
            userInfo.put("introduce", user.getIntroduce());
            userInfo.put("birth", user.getBirth());
            userInfo.put("profileColor", user.getProfileColor());
            userInfo.put("followers", user.getFollowers());

            response.put("userInfo", userInfo);
        }
        return response.toString();
    }

    @RequestMapping(value = "/profile", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postInfo(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           UserEntity user)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        CommonResult result = this.profileService.saveInfo(signedUser,user);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/profile/color", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postProfileColor(@SessionAttribute(value = "signedUser",required = false) UserEntity signedUser,
                                   @RequestParam(value = "profileColor",required = false) String profileColor)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        CommonResult result = this.profileService.controlProfileColor(signedUser, profileColor);
        JSONObject response = new JSONObject();
        response.put("result",result.toStringLower());
        return response.toString();
    }
}
