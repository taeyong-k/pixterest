package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.results.CreationResult;
import com.tyk.pixterest.results.Result;
import com.tyk.pixterest.results.ResultTuple;
import com.tyk.pixterest.services.CreationService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequestMapping(value = "/creation")
public class CreationController {
    private final CreationService creationService;

    @Autowired
    public CreationController(CreationService creationService) {
        this.creationService = creationService;
    }

    @RequestMapping(value = "/pin", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getPin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        if (signedUser == null) {
            return "redirect:/user/login?loginCheck=false";
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            return "redirect:/user/login?loginCheck=forbidden";
        }
        return "creation/pin";
    }

    @RequestMapping(value = "/pin", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                          @RequestParam("title") String title,
                          @RequestParam("content") String content,
                          @RequestParam(value = "link", required = false) String link,
                          @RequestParam(value = "tag", required = false) String tag,
                          @RequestParam(value = "boardId", required = false) Integer boardId,
                          @RequestPart("imageFile") MultipartFile imageFile) {
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

        PinEntity pin = new PinEntity();
        pin.setTitle(title);
        pin.setContent(content);
        pin.setLink(link);
        pin.setTag(tag);
        pin.setBoardId(boardId);

        Result result = creationService.creationPin(signedUser, pin, imageFile);

        JSONObject response = new JSONObject();
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }

    @RequestMapping(value = "/boards", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getBoards(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
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

        ResultTuple<BoardEntity[]> result = creationService.getByBoards(signedUser);
        JSONObject response = new JSONObject();

        if (result.getResult() == CommonResult.SUCCESS) {
            BoardEntity[] boards = result.getPayload();
            response.put("boards", boards);
            response.put("result", result.getResult().toString().toLowerCase());
        } else if (result.getResult() == CreationResult.FAILURE_BOARD_ABSENT) {
            response.put("result", "empty");
            response.put("boards", new JSONArray());    // 빈 배열
        } else {
            response.put("result", result.getResult().toString().toLowerCase());
        }

        return response.toString();
    }

    @RequestMapping(value = "/board", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postBoard(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            BoardEntity board) {
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
        Result result = creationService.creationBoard(signedUser, board);
        JSONObject response = new JSONObject();
        response.put("result", result.toString().toLowerCase());
        return response.toString();
    }
}
