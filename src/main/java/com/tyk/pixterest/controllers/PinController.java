package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.CommentEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.services.CommentService;
import com.tyk.pixterest.services.PinService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/pin")
public class PinController {
    private final PinService pinService;
    private final CommentService commentService;

    @Autowired
    public PinController(PinService pinService, CommentService commentService) {
        this.pinService = pinService;
        this.commentService = commentService;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           @RequestParam(value = "id", required = false) Long pinId,
                           Model model) {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        if (pinId == null) {
            return "redirect:/?pin:error";
        }
        PinEntity pin = this.pinService.getPinById(pinId);
        if (pin == null) {
            return "redirect:/?pin:false";
        }
        model.addAttribute("pin", pin);
        return "pin/detail";
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           @RequestParam("id") Long pinId) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }

        if (pinId == null || pinId <= 0) {
            response.put("result", "failure_absent");
            return response.toString();
        }

        Result result = this.pinService.savePin(signedUser, pinId.intValue());
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }

    // add comment
    @RequestMapping(value = "/comment", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public CommentEntity[] getComment (@RequestParam(value = "id",required = false) int pinId) {
        ResultTuple<CommentEntity[]> result = commentService.getCommentsByPinId(pinId);
        if (result.getResult() == CommonResult.SUCCESS) {
            CommentEntity[] comments = result.getPayload();
            for (CommentEntity comment : comments) {
                if (comment.isDeleted()) {
                    comment.setContent(null);
                }
            }
            return comments;
        }

        return new CommentEntity[0];
    }

    @RequestMapping(value = "/comment", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              CommentEntity comment) {
        if (signedUser == null) {
            JSONObject error = new JSONObject();
            error.put("result", "failure_session_expired");
            return error.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            JSONObject error = new JSONObject();
            error.put("result", "failure_forbidden");
            return error.toString();
        }
        Result result = this.commentService.write(signedUser, comment);
        JSONObject response = new JSONObject();
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }

    @RequestMapping(value = "/comment", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                CommentEntity comment) {
        if (signedUser == null) {
            JSONObject error = new JSONObject();
            error.put("result", "failure_session_expired");
            return error.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            JSONObject error = new JSONObject();
            error.put("result", "failure_forbidden");
            return error.toString();
        }
        Result result = this.commentService.delete(signedUser, comment);
        JSONObject response = new JSONObject();
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }
}
