package com.phongtro247.housing.modules.masterdata.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateMasterDataStatusRequest(@NotNull Boolean status) {
}
