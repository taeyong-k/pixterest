package com.tyk.pixterest.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "email")
public class UserEntity {
    private String email;
    @JsonIgnore
    private String password;
    private String firstName;
    private String name;
    private String nickname;
    private String site;
    private String introduce;
    private LocalDate birth;
    private String profileColor;
    private int followers;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private boolean isAdmin;
    private boolean isDeleted;
    private boolean isSuspended;
}
