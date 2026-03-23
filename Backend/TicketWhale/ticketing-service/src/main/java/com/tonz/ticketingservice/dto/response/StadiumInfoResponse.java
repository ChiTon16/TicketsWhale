package com.tonz.ticketingservice.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StadiumInfoResponse {
    private String name;
    private String team;
    private String location;
    private String city;
    private Integer capacity;
    private String imageUrl;
    private String wikipediaUrl;
    private Integer yearOpened;
}