package com.phongtro247.housing.modules.incidents.api;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.incidents.api.dto.CreateIncidentRequest;
import com.phongtro247.housing.modules.incidents.api.dto.IncidentResponse;
import com.phongtro247.housing.modules.incidents.api.dto.UpdateIncidentRequest;
import com.phongtro247.housing.modules.incidents.application.IncidentService;
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
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ActionResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                 @Valid @RequestBody CreateIncidentRequest request) {
        return incidentService.create(principal, request);
    }

    @GetMapping("/my-listings")
    public DataResponse<List<IncidentResponse>> myListings(@AuthenticationPrincipal AuthenticatedUser principal,
                                                           @RequestParam(required = false) String status,
                                                           @RequestParam(required = false) String search) {
        return DataResponse.of(incidentService.forLandlord(principal, status, search));
    }

    @PatchMapping("/{incidentId}/status")
    public ActionResponse updateStatus(@AuthenticationPrincipal AuthenticatedUser principal,
                                       @PathVariable Long incidentId,
                                       @RequestBody UpdateIncidentRequest request) {
        return incidentService.updateStatus(principal, incidentId, request);
    }
}
