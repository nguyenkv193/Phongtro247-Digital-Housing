package com.phongtro247.housing.modules.masterdata.controller;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.modules.masterdata.dto.CreateMasterDataItemRequest;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataGroupResponse;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataItemResponse;
import com.phongtro247.housing.modules.masterdata.dto.UpdateMasterDataItemRequest;
import com.phongtro247.housing.modules.masterdata.dto.UpdateMasterDataStatusRequest;
import com.phongtro247.housing.modules.masterdata.service.MasterDataService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/master-data")
public class MasterDataAdminController {

    private final MasterDataService masterDataService;

    public MasterDataAdminController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping("/groups")
    public DataResponse<List<MasterDataGroupResponse>> groups(
            @RequestParam(defaultValue = "true") boolean includeInactive) {
        return DataResponse.of(masterDataService.adminGroups(includeInactive));
    }

    @GetMapping("/groups/{groupCode}/items")
    public DataResponse<List<MasterDataItemResponse>> items(
            @PathVariable String groupCode,
            @RequestParam(defaultValue = "true") boolean includeInactive) {
        return DataResponse.of(masterDataService.adminItems(groupCode, includeInactive));
    }

    @PostMapping("/groups/{groupCode}/items")
    public DataResponse<MasterDataItemResponse> create(
            @PathVariable String groupCode,
            @Valid @RequestBody CreateMasterDataItemRequest request) {
        return DataResponse.of(masterDataService.createItem(groupCode, request));
    }

    @PatchMapping("/items/{id}")
    public DataResponse<MasterDataItemResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMasterDataItemRequest request) {
        return DataResponse.of(masterDataService.updateItem(id, request));
    }

    @PatchMapping("/items/{id}/status")
    public ActionResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMasterDataStatusRequest request) {
        return masterDataService.updateStatus(id, request.status());
    }
}
