package com.phongtro247.housing.modules.locations.api;

import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.modules.locations.api.dto.LocationResponse;
import com.phongtro247.housing.modules.locations.domain.LocationEntity;
import com.phongtro247.housing.modules.locations.infrastructure.LocationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationRepository locationRepository;

    public LocationController(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @GetMapping
    public DataResponse<List<LocationResponse>> list() {
        return DataResponse.of(locationRepository.findAllByOrderByNameAsc().stream().map(this::toResponse).toList());
    }

    @GetMapping("/search")
    public DataResponse<List<LocationResponse>> search(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) return DataResponse.of(List.of());
        return DataResponse.of(locationRepository.findTop20ByNameContainingIgnoreCaseOrderByNameAsc(q)
                .stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public DataResponse<LocationResponse> get(@PathVariable Long id) {
        LocationEntity location = locationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Location", id));
        return DataResponse.of(toResponse(location));
    }

    private LocationResponse toResponse(LocationEntity location) {
        return new LocationResponse(location.getId(), location.getName(), location.getType());
    }
}
