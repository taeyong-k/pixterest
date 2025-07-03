package com.tyk.pixterest.entities;

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
    private String password;
    private String name;
    private String nickname;
    private LocalDate birth;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private boolean isAdmin;
    private boolean isDeleted;
    private boolean isSuspended;
}
