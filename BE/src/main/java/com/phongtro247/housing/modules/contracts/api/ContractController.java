package com.phongtro247.housing.modules.contracts.api;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.contracts.api.dto.ContractListingResponse;
import com.phongtro247.housing.modules.contracts.api.dto.ContractRequest;
import com.phongtro247.housing.modules.contracts.api.dto.ContractResponse;
import com.phongtro247.housing.modules.contracts.application.ContractService;
import com.phongtro247.housing.modules.tenants.api.dto.TenantSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping("/listings/by-type")
    public List<ContractListingResponse> listingsByType(@AuthenticationPrincipal AuthenticatedUser principal,
                                                        @RequestParam(required = false) String type) {
        return contractService.listingsByType(principal, type);
    }

    @GetMapping("/tenants")
    public List<TenantSummaryResponse> tenants(@AuthenticationPrincipal AuthenticatedUser principal) {
        return contractService.tenants(principal);
    }

    @GetMapping
    public List<ContractResponse> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return contractService.list(principal);
    }

    @GetMapping("/{id}")
    public ContractResponse get(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        return contractService.get(principal, id);
    }

    @PostMapping
    public ContractResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                   @Valid @RequestBody ContractRequest request) {
        return contractService.create(principal, request);
    }

    @PutMapping("/{id}")
    public ContractResponse update(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id,
                                   @Valid @RequestBody ContractRequest request) {
        return contractService.update(principal, id, request);
    }

    @DeleteMapping("/{id}")
    public ActionResponse delete(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id) {
        return contractService.delete(principal, id);
    }
}
