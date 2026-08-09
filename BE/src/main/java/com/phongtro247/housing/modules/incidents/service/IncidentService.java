package com.phongtro247.housing.modules.incidents.service;

import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.incidents.dto.CreateIncidentRequest;
import com.phongtro247.housing.modules.incidents.dto.IncidentResponse;
import com.phongtro247.housing.modules.incidents.dto.UpdateIncidentRequest;
import com.phongtro247.housing.modules.incidents.entity.IncidentEntity;
import com.phongtro247.housing.modules.incidents.repository.IncidentRepository;
import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import com.phongtro247.housing.modules.listings.repository.ListingRepository;
import com.phongtro247.housing.modules.notifications.entity.NotificationEntity;
import com.phongtro247.housing.modules.notifications.repository.NotificationRepository;
import com.phongtro247.housing.modules.tenants.entity.TenantEntity;
import com.phongtro247.housing.modules.tenants.repository.TenantRepository;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.modules.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final NotificationRepository notificationRepository;

    public IncidentService(IncidentRepository incidentRepository, ListingRepository listingRepository,
                           UserRepository userRepository, TenantRepository tenantRepository,
                           NotificationRepository notificationRepository) {
        this.incidentRepository = incidentRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public ActionResponse create(AuthenticatedUser principal, CreateIncidentRequest request) {
        UserEntity reporter = userRepository.getReferenceById(principal.id());
        ListingEntity listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new NotFoundException("Listing", request.listingId()));
        TenantEntity tenant = tenantRepository.findFirstByUser_IdOrderByCreatedAtDesc(principal.id()).orElse(null);
        incidentRepository.save(new IncidentEntity(listing, tenant, reporter, request.reason(), request.description()));
        return ActionResponse.success(MessageCatalog.SUC_INCIDENT_SUBMITTED);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> forLandlord(AuthenticatedUser principal, String status, String search) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        return incidentRepository.findByListing_Owner_IdOrderByCreatedAtDesc(principal.id()).stream()
                .filter(incident -> matchesStatus(incident, status))
                .filter(incident -> normalizedSearch.isBlank()
                        || incident.getTitle().toLowerCase().contains(normalizedSearch)
                        || (incident.getListing() != null && incident.getListing().getName().toLowerCase().contains(normalizedSearch)))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ActionResponse updateStatus(AuthenticatedUser principal, Long incidentId, UpdateIncidentRequest request) {
        IncidentEntity incident = incidentRepository.findByIdAndListing_Owner_Id(incidentId, principal.id())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, MessageCatalog.ERR_INCIDENT_ACCESS_DENIED));
        UserEntity admin = userRepository.getReferenceById(principal.id());
        String newStatus = request.status() == null || request.status().isBlank()
                ? MessageCatalog.INCIDENT_RESOLVED_STATUS : request.status();
        incident.resolve(admin, newStatus, request.adminResponse());

        UserEntity recipient = incident.getReporter();
        if (recipient != null && request.adminResponse() != null && !request.adminResponse().isBlank()) {
            String listingName = incident.getListing() == null
                    ? MessageCatalog.INCIDENT_DEFAULT_LISTING_NAME : incident.getListing().getName();
            notificationRepository.save(new NotificationEntity(
                    recipient,
                    MessageCatalog.format(MessageCatalog.INCIDENT_NOTIFICATION_TITLE, incident.getTitle()),
                    MessageCatalog.format(MessageCatalog.INCIDENT_NOTIFICATION_MESSAGE, incident.getTitle(),
                            listingName, request.adminResponse())));
        }
        return ActionResponse.success(MessageCatalog.SUC_INCIDENT_UPDATED);
    }

    private boolean matchesStatus(IncidentEntity incident, String requestedStatus) {
        if (requestedStatus == null || requestedStatus.isBlank() || "all".equalsIgnoreCase(requestedStatus)) {
            return true;
        }
        if ("resolved".equalsIgnoreCase(requestedStatus)) {
            return MessageCatalog.INCIDENT_RESOLVED_STATUS.equals(incident.getStatus());
        }
        if ("unresolved".equalsIgnoreCase(requestedStatus)) {
            return !MessageCatalog.INCIDENT_RESOLVED_STATUS.equals(incident.getStatus());
        }
        return requestedStatus.equalsIgnoreCase(incident.getStatus());
    }

    private IncidentResponse toResponse(IncidentEntity incident) {
        String tenantName = incident.getTenant() != null ? incident.getTenant().getName()
                : incident.getReporter() == null ? null : incident.getReporter().getFullName();
        return new IncidentResponse(
                incident.getId(), incident.getTitle(), incident.getDescription(), incident.getStatus(),
                incident.getCreatedAt(), incident.getUpdatedAt(),
                incident.getListing() == null ? null : incident.getListing().getName(), tenantName,
                incident.getAdminResponse());
    }
}
