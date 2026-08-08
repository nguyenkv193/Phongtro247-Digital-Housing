package com.phongtro247.housing.modules.tenants.api;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.locations.api.dto.LocationResponse;
import com.phongtro247.housing.modules.tenants.api.dto.TenantAccommodationResponse;
import com.phongtro247.housing.modules.tenants.api.dto.TenantRequest;
import com.phongtro247.housing.modules.tenants.api.dto.TenantResponse;
import com.phongtro247.housing.modules.tenants.api.dto.TenantStatusRequest;
import com.phongtro247.housing.modules.tenants.application.TenantService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping("/wards")
    public List<LocationResponse> wards() {
        return tenantService.wards();
    }

    @GetMapping
    public List<TenantResponse> list(@AuthenticationPrincipal AuthenticatedUser principal,
                                    @RequestParam(required = false, name = "owner_id") Long ownerId) {
        return tenantService.list(principal, ownerId);
    }

    @GetMapping("/my-info")
    public DataResponse<TenantAccommodationResponse> myInfo(@AuthenticationPrincipal AuthenticatedUser principal) {
        return DataResponse.of(tenantService.myInfo(principal));
    }

    @PostMapping
    public TenantResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                 @Valid @RequestBody TenantRequest request) {
        return tenantService.create(principal, request);
    }

    @PatchMapping("/{id}")
    public ActionResponse updateStatus(@AuthenticationPrincipal AuthenticatedUser principal, @PathVariable Long id,
                                       @Valid @RequestBody TenantStatusRequest request) {
        return tenantService.updateStatus(principal, id, request);
    }
}
