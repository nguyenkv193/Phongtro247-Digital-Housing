package com.phongtro247.housing.modules.tenants.application;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.contracts.api.dto.ContractAccommodationResponse;
import com.phongtro247.housing.modules.contracts.application.ContractService;
import com.phongtro247.housing.modules.locations.api.dto.LocationResponse;
import com.phongtro247.housing.modules.locations.domain.LocationEntity;
import com.phongtro247.housing.modules.locations.infrastructure.LocationRepository;
import com.phongtro247.housing.modules.tenants.api.dto.TenantAccommodationResponse;
import com.phongtro247.housing.modules.tenants.api.dto.TenantRequest;
import com.phongtro247.housing.modules.tenants.api.dto.TenantResponse;
import com.phongtro247.housing.modules.tenants.api.dto.TenantStatusRequest;
import com.phongtro247.housing.modules.tenants.domain.TenantEntity;
import com.phongtro247.housing.modules.tenants.infrastructure.TenantRepository;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import com.phongtro247.housing.modules.users.infrastructure.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final ContractService contractService;

    public TenantService(TenantRepository tenantRepository, UserRepository userRepository,
                         LocationRepository locationRepository, ContractService contractService) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.contractService = contractService;
    }

    @Transactional(readOnly = true)
    public List<LocationResponse> wards() {
        return locationRepository.findByTypeOrderByNameAsc("ward").stream()
                .map(location -> new LocationResponse(location.getId(), location.getName(), location.getType()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TenantResponse> list(AuthenticatedUser principal, Long requestedOwnerId) {
        Long ownerId = principal == null ? requestedOwnerId : principal.id();
        if (ownerId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_OWNER_REQUIRED);
        }
        return tenantRepository.findByOwner_IdOrderByCreatedAtDesc(ownerId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public TenantResponse create(AuthenticatedUser principal, TenantRequest request) {
        Long ownerId = principal == null ? request.ownerId() : principal.id();
        if (ownerId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_OWNER_REQUIRED);
        }
        if (tenantRepository.existsByOwner_IdAndPhone(ownerId, request.phone())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_TENANT_EXISTS);
        }
        UserEntity owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("User", ownerId));
        LocationEntity ward = request.wardId() == null ? null : locationRepository.findById(request.wardId())
                .orElseThrow(() -> new NotFoundException("Location", request.wardId()));
        TenantEntity tenant = new TenantEntity(owner, request.name(), request.phone());
        tenant.updateDetails(request.name(), request.birthday(), request.gender(), ward, request.address(),
                request.phone(), request.email(), request.occupation(), request.cccd(),
                request.stayStatus() == null || request.stayStatus().isBlank() ? "Chưa đăng ký" : request.stayStatus());
        linkToExistingUser(tenant, request.email(), request.phone());
        return toResponse(tenantRepository.save(tenant));
    }

    @Transactional
    public ActionResponse updateStatus(AuthenticatedUser principal, Long id, TenantStatusRequest request) {
        TenantEntity tenant = tenantRepository.findByIdAndOwner_Id(id, principal.id())
                .orElseThrow(() -> new NotFoundException("Tenant", id));
        tenant.updateStayStatus(request.stayStatus());
        return ActionResponse.success(MessageCatalog.SUC_TENANT_UPDATED);
    }

    @Transactional(readOnly = true)
    public TenantAccommodationResponse myInfo(AuthenticatedUser principal) {
        TenantEntity tenant = tenantRepository.findFirstByUser_IdOrderByCreatedAtDesc(principal.id())
                .orElseThrow(() -> new NotFoundException("Tenant", principal.id()));
        ContractAccommodationResponse contract = contractService.latestAccommodationForTenant(tenant.getId()).orElse(null);
        return new TenantAccommodationResponse(
                tenant.getId(), tenant.getOwner() == null ? null : tenant.getOwner().getId(),
                tenant.getUser() == null ? null : tenant.getUser().getId(), tenant.getName(), tenant.getBirthday(),
                tenant.getGender(), tenant.getWard() == null ? null : tenant.getWard().getId(),
                tenant.getWard() == null ? null : tenant.getWard().getName(), tenant.getAddress(), tenant.getPhone(),
                tenant.getEmail(), tenant.getOccupation(), tenant.getCccd(), tenant.getStayStatus(),
                tenant.getCreatedAt(), contract);
    }

    private void linkToExistingUser(TenantEntity tenant, String email, String phone) {
        String identifier = email == null || email.isBlank() ? phone : email;
        if (identifier != null && !identifier.isBlank()) {
            userRepository.findByEmailOrPhone(identifier).ifPresent(tenant::linkUser);
        }
    }

    private TenantResponse toResponse(TenantEntity tenant) {
        return new TenantResponse(
                tenant.getId(), tenant.getOwner() == null ? null : tenant.getOwner().getId(),
                tenant.getUser() == null ? null : tenant.getUser().getId(), tenant.getName(), tenant.getBirthday(),
                tenant.getGender(), tenant.getWard() == null ? null : tenant.getWard().getId(),
                tenant.getWard() == null ? null : tenant.getWard().getName(), tenant.getAddress(), tenant.getPhone(),
                tenant.getEmail(), tenant.getOccupation(), tenant.getCccd(), tenant.getStayStatus(),
                tenant.getCreatedAt());
    }
}
