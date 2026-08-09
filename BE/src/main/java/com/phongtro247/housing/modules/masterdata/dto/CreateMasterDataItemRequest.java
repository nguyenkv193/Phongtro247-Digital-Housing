package com.phongtro247.housing.modules.masterdata.dto;

import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateMasterDataItemRequest(
        @NotBlank(message = MessageCatalog.VALIDATION_CODE_REQUIRED)
        @Size(max = 50, message = MessageCatalog.VALIDATION_CODE_MAX_LENGTH)
        @Pattern(regexp = "^[a-z0-9]+(?:[-_][a-z0-9]+)*$", message = MessageCatalog.VALIDATION_CODE_FORMAT)
        String code,
        @NotBlank(message = MessageCatalog.VALIDATION_MASTER_DATA_NAME_REQUIRED)
        @Size(max = 100, message = MessageCatalog.VALIDATION_MASTER_DATA_NAME_MAX_LENGTH)
        String name,
        @Size(max = 300, message = MessageCatalog.VALIDATION_MASTER_DATA_DESCRIPTION_MAX_LENGTH)
        String description,
        Boolean status
) {
}
