package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.entities.UserEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.services.MyPageService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @RequestMapping(value = "/board", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getBoard(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                           @RequestParam(value = "boardId" ,required = false) Integer boardId)
    {
        BoardEntity board = this.myPageService.getBoardByBoardId(signedUser, boardId);
        JSONObject response = new JSONObject();
        response.put("result", CommonResult.SUCCESS.toStringLower());
        response.put("boardName", board.getName());
        return response.toString();
    }

    @RequestMapping(value = "/board", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postBoard(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            BoardEntity board)
    {
        JSONObject response = new JSONObject();

        if (signedUser == null) {

            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (signedUser.isSuspended() || signedUser.isDeleted()) {
            response.put("result", "failure_forbidden");
            return response.toString();
        }
        CommonResult result = this.myPageService.saveBoard(signedUser, board);
        response.put("result", result.toStringLower());

        if (result == CommonResult.SUCCESS) {
            // 보드 정보를 다시 가져와서 response에 담기 (필요한 필드만)
            // 예: board.getId(), board.getName(), board.getCoverImage() 등
            JSONObject boardJson = new JSONObject();
            boardJson.put("id", board.getId());
            boardJson.put("name", board.getName());
            boardJson.put("coverImage", board.getCoverImage());

            response.put("board", boardJson);
        }
        return response.toString();
    }

    @RequestMapping(value = "/pins", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getBoardPin(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "boardId") int boardId)
    {
        List<PinEntity> boardPins = this.myPageService.getPintykBoardId(boardId);
        JSONObject response = new JSONObject();
        response.put("result", CommonResult.SUCCESS.toStringLower());
        response.put("pins", boardPins);
        return response.toString();
    }

    @RequestMapping(value = "/pin/delete", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPinDelete(@SessionAttribute(value = "signedUser",required = false) UserEntity signedUser,
                                @RequestParam(value = "pinId", required = false) Integer pinId)
    {
        CommonResult result = this.myPageService.deletePinAtBoard(signedUser, pinId);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }

    @RequestMapping(value = "/board/delete", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPinDelete(@SessionAttribute(value = "signedUser",required = false) UserEntity signedUser,
                                @RequestParam(value = "boardId", required = false) int boardId)
    {
        CommonResult result = this.myPageService.deleteBoard(signedUser, boardId);
        JSONObject response = new JSONObject();
        response.put("result", result.toStringLower());
        return response.toString();
    }
}
