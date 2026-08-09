package com.phongtro247.housing.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record UpdateHotLabelRequest(@JsonAlias({"isHot", "is_hot"}) boolean isHot) {
}
