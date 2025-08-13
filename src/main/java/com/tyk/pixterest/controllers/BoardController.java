package com.tyk.pixterest.controllers;

import com.tyk.pixterest.entities.BoardEntity;
import com.tyk.pixterest.entities.PinEntity;
import com.tyk.pixterest.results.CommonResult;
import com.tyk.pixterest.services.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/board")
public class BoardController {

    private final BoardService boardService;

    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    // 보드 리스트 또는 기본 진입 시
    @RequestMapping(method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getBoardList(@RequestParam(value = "boardId", required = false) Integer boardId,
                               Model model) {

        if (boardId != null) {
            BoardEntity board = boardService.getBoardById(boardId);
            if (board != null) {
                List<PinEntity> pins = boardService.getPintykBoardId(boardId);
                model.addAttribute("board", board);
                model.addAttribute("pins", pins);
            }
        }

        return "board/view";
    }

    // 보드 상세 (기존 유지)
    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getBoard(@RequestParam(value = "boardId", required = false) Integer boardId,
                           Model model) {

        BoardEntity board = boardService.getBoardById(boardId);
        if (board == null) {
            return CommonResult.FAILURE.toStringLower();
        }

        List<PinEntity> pins = boardService.getPintykBoardId(boardId);
        model.addAttribute("board", board);
        model.addAttribute("pins", pins);
        return "board/view";
    }
}