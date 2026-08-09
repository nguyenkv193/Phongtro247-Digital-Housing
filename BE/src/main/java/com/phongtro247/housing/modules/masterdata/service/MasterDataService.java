package com.phongtro247.housing.modules.masterdata.service;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.modules.masterdata.dto.CreateMasterDataItemRequest;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataGroupResponse;
import com.phongtro247.housing.modules.masterdata.dto.MasterDataItemResponse;
import com.phongtro247.housing.modules.masterdata.dto.UpdateMasterDataItemRequest;
import com.phongtro247.housing.modules.masterdata.entity.MasterCodeEntity;
import com.phongtro247.housing.modules.masterdata.repository.MasterCodeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class MasterDataService {

    private static final List<CategoryDefinition> CATEGORY_DEFINITIONS = List.of(
            new CategoryDefinition("AMENITY", "Tiện ích phòng", "Danh sách tiện ích có thể chọn cho tin đăng", 10),
            new CategoryDefinition("SURROUNDING", "Khu vực xung quanh", "Các địa điểm và tiện ích xung quanh tin đăng", 20),
            new CategoryDefinition("GENDER", "Giới tính", "Danh mục giới tính dùng trong hồ sơ", 30),
            new CategoryDefinition("TRANSACTION_TYPE", "Loại giao dịch", "Danh mục loại giao dịch tài chính", 40),
            new CategoryDefinition("EXPENSE_CATEGORY", "Nhóm chi phí", "Danh mục nhóm chi phí vận hành", 50));

    private final MasterCodeRepository masterCodeRepository;

    public MasterDataService(MasterCodeRepository masterCodeRepository) {
        this.masterCodeRepository = masterCodeRepository;
    }

    @Transactional(readOnly = true)
    public List<MasterDataGroupResponse> publicGroups() {
        return categoryResponses(false);
    }

    @Transactional(readOnly = true)
    public List<MasterDataItemResponse> publicItems(String categoryCode) {
        String normalizedCategoryCode = normalizeCategoryCode(categoryCode);
        List<MasterCodeEntity> codes = masterCodeRepository
                .findByCategoryCodeIgnoreCaseAndStatusTrueOrderByNameAsc(normalizedCategoryCode);
        if (codes.isEmpty()) {
            throw new NotFoundException("MasterDataCategory", categoryCode);
        }
        return codes.stream().map(this::toItemResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MasterDataGroupResponse> adminGroups(boolean includeInactive) {
        return categoryResponses(includeInactive);
    }

    @Transactional(readOnly = true)
    public List<MasterDataItemResponse> adminItems(String categoryCode, boolean includeInactive) {
        String normalizedCategoryCode = normalizeCategoryCode(categoryCode);
        List<MasterCodeEntity> codes = includeInactive
                ? masterCodeRepository.findByCategoryCodeIgnoreCaseOrderByNameAsc(normalizedCategoryCode)
                : masterCodeRepository.findByCategoryCodeIgnoreCaseAndStatusTrueOrderByNameAsc(normalizedCategoryCode);
        if (codes.isEmpty()) {
            throw new NotFoundException("MasterDataCategory", categoryCode);
        }
        return codes.stream().map(this::toItemResponse).toList();
    }

    @Transactional
    public MasterDataItemResponse createItem(String categoryCode, CreateMasterDataItemRequest request) {
        String normalizedCategoryCode = normalizeCategoryCode(categoryCode);
        String normalizedCode = normalizeCode(request.code());
        if (masterCodeRepository.existsByCategoryCodeIgnoreCaseAndCodeIgnoreCase(normalizedCategoryCode, normalizedCode)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_MASTER_DATA_ITEM_EXISTS);
        }

        MasterCodeEntity masterCode = new MasterCodeEntity(
                normalizedCategoryCode,
                normalizedCode,
                request.name().trim(),
                trimToNull(request.description()),
                request.status() == null || request.status());
        return toItemResponse(masterCodeRepository.save(masterCode));
    }

    @Transactional
    public MasterDataItemResponse updateItem(Long id, UpdateMasterDataItemRequest request) {
        MasterCodeEntity masterCode = findMasterCode(id);
        String normalizedCode = normalizeCode(request.code());
        if (masterCodeRepository.existsByCategoryCodeIgnoreCaseAndCodeIgnoreCaseAndIdNot(
                masterCode.getCategoryCode(), normalizedCode, id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_MASTER_DATA_ITEM_EXISTS);
        }

        masterCode.update(
                normalizedCode,
                request.name().trim(),
                trimToNull(request.description()),
                request.status() == null ? masterCode.isStatus() : request.status());
        return toItemResponse(masterCode);
    }

    @Transactional
    public ActionResponse updateStatus(Long id, boolean status) {
        MasterCodeEntity masterCode = findMasterCode(id);
        masterCode.updateStatus(status);
        return ActionResponse.success(MessageCatalog.SUC_MASTER_DATA_ITEM_STATUS_UPDATED);
    }

    private List<MasterDataGroupResponse> categoryResponses(boolean includeInactive) {
        List<MasterCodeEntity> codes = includeInactive
                ? masterCodeRepository.findAllByOrderByCategoryCodeAscNameAsc()
                : masterCodeRepository.findByStatusTrueOrderByCategoryCodeAscNameAsc();

        Map<String, Boolean> categories = new LinkedHashMap<>();
        codes.forEach(code -> categories.merge(code.getCategoryCode(), code.isStatus(), Boolean::logicalOr));

        return categories.keySet().stream()
                .sorted(categoryComparator())
                .map(code -> toGroupResponse(code, categories.getOrDefault(code, false)))
                .toList();
    }

    private Comparator<String> categoryComparator() {
        return Comparator.comparingInt(this::categoryOrder)
                .thenComparing(String::compareToIgnoreCase);
    }

    private int categoryOrder(String categoryCode) {
        return CATEGORY_DEFINITIONS.stream()
                .filter(category -> category.code().equalsIgnoreCase(categoryCode))
                .map(CategoryDefinition::order)
                .findFirst()
                .orElse(999);
    }

    private MasterDataGroupResponse toGroupResponse(String categoryCode, boolean status) {
        CategoryDefinition definition = CATEGORY_DEFINITIONS.stream()
                .filter(category -> category.code().equalsIgnoreCase(categoryCode))
                .findFirst()
                .orElseGet(() -> new CategoryDefinition(
                        categoryCode,
                        humanize(categoryCode),
                        "Danh mục dùng chung của hệ thống",
                        999));
        return new MasterDataGroupResponse(definition.code(), definition.name(), definition.description(), status);
    }

    private MasterCodeEntity findMasterCode(Long id) {
        return masterCodeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("MasterCode", id));
    }

    private String normalizeCategoryCode(String categoryCode) {
        return categoryCode.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeCode(String code) {
        return code.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String humanize(String value) {
        String normalized = value.toLowerCase(Locale.ROOT).replace('_', ' ');
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }

    private MasterDataItemResponse toItemResponse(MasterCodeEntity masterCode) {
        return new MasterDataItemResponse(
                masterCode.getId(),
                masterCode.getCategoryCode(),
                masterCode.getCode(),
                masterCode.getName(),
                masterCode.getDescription(),
                masterCode.isStatus(),
                masterCode.getCreatedAt(),
                masterCode.getUpdatedAt());
    }

    private record CategoryDefinition(String code, String name, String description, int order) {
    }
}
