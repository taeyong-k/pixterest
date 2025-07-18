package com.tyk.pixterest.entities;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class PinUserSaveEntity {
    private int id;
    private String userEmail;
    private int pinId;
    private LocalDateTime savedAt;
}
