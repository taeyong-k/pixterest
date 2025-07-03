package com.tyk.pixterest.entities;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class PinEntity {
    private int id;
    private String userEmail;
    private String title;
    private String content;
    private String link;
    private String tag;
    private String image;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private boolean isDeleted;
}
