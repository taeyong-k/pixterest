package com.tyk.pixterest.results;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ResultTuple<T> {
    private Result result;
    private T payload;
}
