package com.phongtro247.housing.modules.promotions.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record PromotionAdminDecisionRequest(
        @JsonAlias({"videoUrl", "video_url"}) String videoUrl,
        @JsonAlias({"adminNote", "admin_note"}) String adminNote
) {
}
