package com.phongtro247.housing.modules.masterdata.dto;

import java.time.LocalDateTime;

public record MasterDataItemResponse(
        Long id,
        String categoryCode,
        String code,
        String name,
        String description,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
