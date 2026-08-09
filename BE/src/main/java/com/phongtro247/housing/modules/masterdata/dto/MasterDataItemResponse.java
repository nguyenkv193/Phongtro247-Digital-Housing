package com.phongtro247.housing.modules.masterdata.dto;

import java.time.Instant;

public record MasterDataItemResponse(
        Long id,
        String groupCode,
        String code,
        String name,
        String description,
        int sortOrder,
        boolean active,
        String metadata,
        Instant createdAt,
        Instant updatedAt
) {
}
