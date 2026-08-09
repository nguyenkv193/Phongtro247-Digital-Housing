package com.phongtro247.housing.modules.users.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record HostInfoStatusResponse(boolean hasCompletedHostInfo, String role) {
}
