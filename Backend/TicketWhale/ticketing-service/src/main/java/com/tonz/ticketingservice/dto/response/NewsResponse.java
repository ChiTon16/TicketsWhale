package com.tonz.ticketingservice.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NewsResponse {
    private String title;
    private String description;
    private String url;
    private String imageUrl;
    private String publishedAt;
    private String source;
}