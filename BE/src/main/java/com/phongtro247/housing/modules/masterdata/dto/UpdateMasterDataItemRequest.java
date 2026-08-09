package com.phongtro247.housing.modules.masterdata.dto;

import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateMasterDataItemRequest(
        @NotBlank(message = MessageCatalog.VALIDATION_CODE_REQUIRED)
        @Pattern(regexp = "^[a-z0-9]+(?:[-_][a-z0-9]+)*$", message = MessageCatalog.VALIDATION_CODE_FORMAT)
        String code,
        @NotBlank(message = MessageCatalog.VALIDATION_MASTER_DATA_NAME_REQUIRED)
        String name,
        String description,
        @Min(value = 0, message = MessageCatalog.VALIDATION_SORT_ORDER_MINIMUM)
        Integer sortOrder,
        Boolean active,
        String metadata
) {
}
