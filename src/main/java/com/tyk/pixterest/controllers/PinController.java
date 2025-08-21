package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.CommentEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.CreationResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.services.CommentService;
import com.tyk.pixterest.services.CreationService;
import com.tyk.pixterest.services.PinService;
import com.tyk.pixterest.vos.CommentVo;
import org.json.JSONArray;
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
    private final CreationService creationService;

    @Autowired
    public PinController(PinService pinService, CommentService commentService, CreationService creationService) {
        this.pinService = pinService;
        this.commentService = commentService;
        this.creationService = creationService;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           @RequestParam(value = "id", required = false) Long pinId,
                           Model model) {
        if (pinId == null) {
            return "redirect:/?pin:error";
        }
        PinEntity pin = this.pinService.getPinById(pinId);
        if (pin == null) {
            return "redirect:/?pin:false";
        }

        boolean isSaved = false;
        if (signedUser != null) {
            isSaved = this.pinService.isPinSavedByUser(signedUser, pinId.intValue());
        }

        model.addAttribute("pin", pin);
        model.addAttribute("isSaved", isSaved);

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

    @RequestMapping(value = "/edit-boards", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getEditBoardInfo(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                   @RequestParam(value = "pinId") Long pinId) {
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

        PinEntity pin = this.pinService.getPinById(pinId);
        if (pin == null) {
            response.put("result", "failure_not_found");
            return response.toString();
        }

        Integer selectedBoardId = pin.getBoardId();

        // 유저가 만든 보드 리스트 조회
        ResultTuple<BoardEntity[]> result = creationService.getByBoards(signedUser);

        if (result.getResult() == CommonResult.SUCCESS) {
            BoardEntity[] boards = result.getPayload();
            response.put("boards", boards);
            response.put("selectedBoardId", selectedBoardId != null ? selectedBoardId : JSONObject.NULL);
            response.put("result", result.getResult().toString().toLowerCase());
        } else if (result.getResult() == CreationResult.FAILURE_BOARD_ABSENT) {
            response.put("boards", new JSONArray());
            response.put("selectedBoardId", JSONObject.NULL);
            response.put("result", "empty");
        } else {
            response.put("result", result.getResult().toString().toLowerCase());
        }

        return response.toString();
    }


    @RequestMapping(value = "/edit-info", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getEditInfo(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "pinId") Long pinId) {
        JSONObject response = new JSONObject();

        if (pinId == null || pinId <= 0) {
            response.put("result", "failure_absent");
            return response.toString();
        }
        PinEntity pin = this.pinService.getPinById(pinId);
        if (pin == null) {
            response.put("result", "failure_not_found");
            return response.toString();
        }
        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }

        // 로그인한 유저가 해당 핀의 작성자 인가??
        boolean isMine = signedUser.getEmail().equals(pin.getUserEmail());
        if (!isMine) {
            response.put("result", "failure_not_owner");
            return response.toString();
        }

        response.put("result", "success");
        response.put("id", pin.getId());
        response.put("boardId", pin.getBoardId());
        response.put("title", pin.getTitle());
        response.put("content", pin.getContent());
        response.put("link", pin.getLink());
        response.put("tag", pin.getTag());
        response.put("isMine", true);

        return response.toString();
    }

    @RequestMapping(value = "/edit-hide", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String hidePin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                          @RequestParam(value = "pinId") int pinId) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isDeleted() || signedUser.isSuspended()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }
        Result result = this.pinService.hidePin(signedUser, pinId);
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }

    @RequestMapping(value = "/edit-write", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String writePin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           @RequestParam(value = "pinId") int pinId,
                           @RequestParam(value = "title") String title,
                           @RequestParam(value = "content") String content,
                           @RequestParam(value = "link", required = false) String link,
                           @RequestParam(value = "tag", required = false) String tag,
                           @RequestParam(value = "boardId", required = false) Integer boardId) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isDeleted() || signedUser.isSuspended()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }
        Result result = this.pinService.writePin(signedUser, pinId, title, content, link, tag, boardId);
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }

    // add comment
    @RequestMapping(value = "/comment", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public CommentVo[] getComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                  @RequestParam(value = "id", required = false) int pinId) {
        ResultTuple<CommentVo[]> result = commentService.getCommentsByPinId(pinId);
        if (result.getResult() == CommonResult.SUCCESS) {
            CommentVo[] comments = result.getPayload();
            String signedUserEmail = signedUser == null ? null : signedUser.getEmail();
            for (CommentVo comment : comments) {
                if (comment.isDeleted()) {
                    comment.setContent(null);
                }
                comment.setMine(comment.getUserEmail().equals(signedUserEmail));
                if (comment.getProfileColor() == null) comment.setProfileColor("#ccc");
            }
            return comments;
        }
        return new CommentVo[0];
    }

    @RequestMapping(value = "/comment", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                               CommentEntity comment) {
        Result result = this.commentService.modify(signedUser, comment);
        JSONObject response = new JSONObject();
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }

    @RequestMapping(value = "/comment", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              CommentEntity comment) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }
        Result result = this.commentService.write(signedUser, comment);
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }

    @RequestMapping(value = "/comment", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteComment(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                CommentEntity comment) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }
        Result result = this.commentService.delete(signedUser, comment);
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }
}
