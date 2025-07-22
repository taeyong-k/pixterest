package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.services.MyPageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttribute;

import java.util.List;

@Controller
@RequestMapping(value = "/user")
public class MyPageController {

    private final MyPageService myPageService;

    @Autowired
    public MyPageController(MyPageService myPageService) {
        this.myPageService = myPageService;
    }

    @RequestMapping(value = "/myPage", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getMyPage(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            Model model)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }

        return "redirect:/user/created";
    }

    @RequestMapping(value = "/created", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getCreated(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             Model model)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        // 본인이 만든 Board + Pin
        List<BoardEntity> boards = myPageService.getBoardtykUser(signedUser.getEmail());
        List<PinEntity> pins = myPageService.getPintykUser(signedUser.getEmail());

        model.addAttribute("boards", boards);
        model.addAttribute("pins", pins);
        model.addAttribute("category", "created"); // 👈 뷰에서 active 탭 구분용
        return "user/myPage";
    }


    @RequestMapping(value = "/saved", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getSaved(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           Model model)
    {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        // 본인이 저장한 Pin 가져오기
        List<PinEntity> savedPins = myPageService.getSavedPintykUser(signedUser.getEmail());

        model.addAttribute("pins", savedPins);
        model.addAttribute("category", "saved"); // 👈 뷰에서 active 탭 구분용
        return "user/myPage";
    }


}
