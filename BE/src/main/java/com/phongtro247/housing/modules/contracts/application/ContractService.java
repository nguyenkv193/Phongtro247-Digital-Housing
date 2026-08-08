package com.phongtro247.housing.modules.contracts.application;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.contracts.api.dto.ContractAccommodationResponse;
import com.phongtro247.housing.modules.contracts.api.dto.ContractListingResponse;
import com.phongtro247.housing.modules.contracts.api.dto.ContractRequest;
import com.phongtro247.housing.modules.contracts.api.dto.ContractResponse;
import com.phongtro247.housing.modules.contracts.domain.ContractEntity;
import com.phongtro247.housing.modules.contracts.infrastructure.ContractRepository;
import com.phongtro247.housing.modules.listings.domain.ListingEntity;
import com.phongtro247.housing.modules.listings.infrastructure.ListingRepository;
import com.phongtro247.housing.modules.tenants.api.dto.TenantSummaryResponse;
import com.phongtro247.housing.modules.tenants.domain.TenantEntity;
import com.phongtro247.housing.modules.tenants.infrastructure.TenantRepository;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import com.phongtro247.housing.modules.users.infrastructure.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public ContractService(ContractRepository contractRepository, TenantRepository tenantRepository,
                           ListingRepository listingRepository, UserRepository userRepository) {
        this.contractRepository = contractRepository;
        this.tenantRepository = tenantRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> list(AuthenticatedUser principal) {
        return contractRepository.findByOwner_IdOrderByCreatedAtDesc(principal.id())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ContractResponse get(AuthenticatedUser principal, Long id) {
        return toResponse(contractRepository.findByIdAndOwner_Id(id, principal.id())
                .orElseThrow(() -> new NotFoundException("Contract", id)));
    }

    @Transactional
    public ContractResponse create(AuthenticatedUser principal, ContractRequest request) {
        if (request.tenantId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_TENANT_REQUIRED);
        }
        UserEntity owner = userRepository.getReferenceById(principal.id());
        TenantEntity tenant = tenantRepository.findByIdAndOwner_Id(request.tenantId(), principal.id())
                .orElseThrow(() -> new NotFoundException("Tenant", request.tenantId()));
        ListingEntity listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new NotFoundException("Listing", request.listingId()));
        assertOwner(listing, principal.id());
        validateDates(request.startDate(), request.endDate());
        ContractEntity contract = new ContractEntity(
                tenant, listing, listing.getListingType(), owner, request.startDate(), request.endDate(),
                request.depositPrice(), request.rentPrice(), request.note(), statusFor(request.endDate()));
        return toResponse(contractRepository.save(contract));
    }

    @Transactional
    public ContractResponse update(AuthenticatedUser principal, Long id, ContractRequest request) {
        ContractEntity contract = contractRepository.findByIdAndOwner_Id(id, principal.id())
                .orElseThrow(() -> new NotFoundException("Contract", id));
        ListingEntity listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new NotFoundException("Listing", request.listingId()));
        assertOwner(listing, principal.id());
        validateDates(request.startDate(), request.endDate());
        contract.update(request.startDate(), request.endDate(), request.depositPrice(), request.rentPrice(),
                request.note(), listing, listing.getListingType(), statusFor(request.endDate()));
        return toResponse(contract);
    }

    @Transactional
    public ActionResponse delete(AuthenticatedUser principal, Long id) {
        ContractEntity contract = contractRepository.findByIdAndOwner_Id(id, principal.id())
                .orElseThrow(() -> new NotFoundException("Contract", id));
        contractRepository.delete(contract);
        return ActionResponse.success(MessageCatalog.SUC_CONTRACT_DELETED);
    }

    @Transactional(readOnly = true)
    public List<ContractListingResponse> listingsByType(AuthenticatedUser principal, String type) {
        return listingRepository.findAll().stream()
                .filter(listing -> listing.getOwner() != null && listing.getOwner().getId().equals(principal.id()))
                .filter(listing -> type == null || type.isBlank()
                        || (listing.getListingType() != null && listing.getListingType().getName().equalsIgnoreCase(type)))
                .map(listing -> new ContractListingResponse(
                        listing.getId(), listing.getName(), listing.getPrice(), listing.getAddress(),
                        listing.getListingType() == null ? null : listing.getListingType().getName(),
                        listing.getListingType() == null ? null : listing.getListingType().getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TenantSummaryResponse> tenants(AuthenticatedUser principal) {
        return tenantRepository.findByOwner_IdOrderByCreatedAtDesc(principal.id()).stream()
                .map(tenant -> new TenantSummaryResponse(tenant.getId(), tenant.getName(), tenant.getPhone()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ContractAccommodationResponse> latestAccommodationForTenant(Long tenantId) {
        return contractRepository.findFirstByTenant_IdOrderByCreatedAtDesc(tenantId).map(this::toAccommodationResponse);
    }

    private ContractResponse toResponse(ContractEntity contract) {
        TenantEntity tenant = contract.getTenant();
        ListingEntity listing = contract.getListing();
        return new ContractResponse(
                contract.getId(), listing == null ? null : listing.getId(), tenant == null ? null : tenant.getId(),
                contract.getStartDate(), contract.getEndDate(), contract.getDepositPrice(), contract.getRentPrice(),
                contract.getNote(), contract.getStatus(), contract.getCreatedAt(),
                tenant == null ? null : tenant.getName(), tenant == null ? null : tenant.getPhone(),
                listing == null ? null : listing.getName(),
                contract.getListingType() == null ? null : contract.getListingType().getName(),
                contract.getOwner() == null ? null : contract.getOwner().getFullName());
    }

    private ContractAccommodationResponse toAccommodationResponse(ContractEntity contract) {
        ListingEntity listing = contract.getListing();
        UserEntity owner = contract.getOwner();
        return new ContractAccommodationResponse(
                contract.getId(), contract.getStartDate(), contract.getEndDate(), contract.getDepositPrice(),
                contract.getRentPrice(), contract.getNote(), contract.getStatus(),
                listing == null ? null : listing.getId(), listing == null ? null : listing.getName(),
                listing == null ? null : listing.getAddress(), listing == null ? null : listing.getPrice(),
                listing == null ? null : listing.getArea(),
                contract.getListingType() == null ? null : contract.getListingType().getName(),
                owner == null ? null : owner.getFullName(), owner == null ? null : owner.getPhone(),
                owner == null ? null : owner.getEmail());
    }

    private void assertOwner(ListingEntity listing, Long userId) {
        if (listing.getOwner() == null || !listing.getOwner().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, MessageCatalog.ERR_LISTING_OWNER_REQUIRED);
        }
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_INVALID_CONTRACT_DATES);
        }
    }

    private String statusFor(LocalDate endDate) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        long days = ChronoUnit.DAYS.between(today, endDate);
        if (endDate.isBefore(today)) return MessageCatalog.CONTRACT_EXPIRED_STATUS;
        if (days <= 30) return MessageCatalog.CONTRACT_EXPIRING_STATUS;
        return MessageCatalog.CONTRACT_ACTIVE_STATUS;
    }
}
