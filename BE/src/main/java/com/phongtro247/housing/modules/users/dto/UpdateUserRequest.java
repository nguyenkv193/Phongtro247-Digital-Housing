package com.phongtro247.housing.modules.users.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.time.LocalDate;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record UpdateUserRequest(
        String fullName,
        String gender,
        LocalDate birthday,
        String cccd,
        String email,
        String phone,
        String address
) {
}
