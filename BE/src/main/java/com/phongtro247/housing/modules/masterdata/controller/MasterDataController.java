package com.phongtro247.housing.modules.masterdata.controller;

import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataGroupResponse;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataItemResponse;
import com.phongtro247.housing.modules.masterdata.service.MasterDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/master-data")
public class MasterDataController {

    private final MasterDataService masterDataService;

    public MasterDataController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping("/groups")
    public DataResponse<List<MasterDataGroupResponse>> groups() {
        return DataResponse.of(masterDataService.publicGroups());
    }

    @GetMapping("/{groupCode}")
    public DataResponse<List<MasterDataItemResponse>> items(@PathVariable String groupCode) {
        return DataResponse.of(masterDataService.publicItems(groupCode));
    }
}
