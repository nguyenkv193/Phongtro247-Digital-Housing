package com.phongtro247.housing.modules.masterdata.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.modules.masterdata.dto.CreateMasterDataItemRequest;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataGroupResponse;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataItemResponse;
import com.phongtro247.housing.modules.masterdata.dto.UpdateMasterDataItemRequest;
import com.phongtro247.housing.modules.masterdata.entity.MasterDataGroupEntity;
import com.phongtro247.housing.modules.masterdata.entity.MasterDataItemEntity;
import com.phongtro247.housing.modules.masterdata.repository.MasterDataGroupRepository;
import com.phongtro247.housing.modules.masterdata.repository.MasterDataItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

@Service
public class MasterDataService {

    private final MasterDataGroupRepository groupRepository;
    private final MasterDataItemRepository itemRepository;
    private final ObjectMapper objectMapper;

    public MasterDataService(MasterDataGroupRepository groupRepository,
                             MasterDataItemRepository itemRepository,
                             ObjectMapper objectMapper) {
        this.groupRepository = groupRepository;
        this.itemRepository = itemRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<MasterDataGroupResponse> publicGroups() {
        return groupRepository.findByActiveTrueOrderBySortOrderAscNameAsc().stream()
                .map(this::toGroupResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MasterDataItemResponse> publicItems(String groupCode) {
        MasterDataGroupEntity group = findGroup(groupCode);
        if (!group.isActive()) {
            throw new NotFoundException("MasterDataGroup", groupCode);
        }
        return itemRepository.findByGroup_CodeIgnoreCaseAndActiveTrueOrderBySortOrderAscNameAsc(group.getCode())
                .stream().map(this::toItemResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MasterDataGroupResponse> adminGroups(boolean includeInactive) {
        List<MasterDataGroupEntity> groups = includeInactive
                ? groupRepository.findAllByOrderBySortOrderAscNameAsc()
                : groupRepository.findByActiveTrueOrderBySortOrderAscNameAsc();
        return groups.stream().map(this::toGroupResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MasterDataItemResponse> adminItems(String groupCode, boolean includeInactive) {
        MasterDataGroupEntity group = findGroup(groupCode);
        List<MasterDataItemEntity> items = includeInactive
                ? itemRepository.findByGroup_CodeIgnoreCaseOrderBySortOrderAscNameAsc(group.getCode())
                : itemRepository.findByGroup_CodeIgnoreCaseAndActiveTrueOrderBySortOrderAscNameAsc(group.getCode());
        return items.stream().map(this::toItemResponse).toList();
    }

    @Transactional
    public MasterDataItemResponse createItem(String groupCode, CreateMasterDataItemRequest request) {
        MasterDataGroupEntity group = findGroup(groupCode);
        String code = normalizeCode(request.code());
        if (itemRepository.existsByGroup_IdAndCodeIgnoreCase(group.getId(), code)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_MASTER_DATA_ITEM_EXISTS);
        }
        MasterDataItemEntity item = new MasterDataItemEntity(
                group,
                code,
                request.name().trim(),
                trimToNull(request.description()),
                request.sortOrder() == null ? 0 : request.sortOrder(),
                request.active() == null || request.active(),
                normalizeMetadata(request.metadata()));
        return toItemResponse(itemRepository.save(item));
    }

    @Transactional
    public MasterDataItemResponse updateItem(Long id, UpdateMasterDataItemRequest request) {
        MasterDataItemEntity item = findItem(id);
        String code = normalizeCode(request.code());
        if (itemRepository.existsByGroup_IdAndCodeIgnoreCaseAndIdNot(item.getGroup().getId(), code, id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_MASTER_DATA_ITEM_EXISTS);
        }
        item.update(
                code,
                request.name().trim(),
                trimToNull(request.description()),
                request.sortOrder() == null ? 0 : request.sortOrder(),
                request.active() == null || request.active(),
                normalizeMetadata(request.metadata()));
        return toItemResponse(item);
    }

    @Transactional
    public ActionResponse updateStatus(Long id, boolean active) {
        MasterDataItemEntity item = findItem(id);
        item.setActive(active);
        return ActionResponse.success(MessageCatalog.SUC_MASTER_DATA_ITEM_STATUS_UPDATED);
    }

    private MasterDataGroupEntity findGroup(String code) {
        return groupRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new NotFoundException("MasterDataGroup", code));
    }

    private MasterDataItemEntity findItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("MasterDataItem", id));
    }

    private String normalizeCode(String code) {
        return code.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeMetadata(String metadata) {
        if (!StringUtils.hasText(metadata)) {
            return "{}";
        }
        try {
            objectMapper.readTree(metadata);
            return metadata.trim();
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_MASTER_DATA_INVALID_METADATA);
        }
    }

    private MasterDataGroupResponse toGroupResponse(MasterDataGroupEntity group) {
        return new MasterDataGroupResponse(group.getCode(), group.getName(), group.getDescription(),
                group.isSystemManaged(), group.isActive(), group.getSortOrder());
    }

    private MasterDataItemResponse toItemResponse(MasterDataItemEntity item) {
        return new MasterDataItemResponse(item.getId(), item.getGroup().getCode(), item.getCode(), item.getName(),
                item.getDescription(), item.getSortOrder(), item.isActive(), item.getMetadata(),
                item.getCreatedAt(), item.getUpdatedAt());
    }
}
