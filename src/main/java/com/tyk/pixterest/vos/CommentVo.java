package com.tyk.pixterest.vos;

import com.tyk.pixterest.entities.CommentEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CommentVo extends CommentEntity {
    private String userNickname;
    private String profileColor;
    private boolean isMine;
}
