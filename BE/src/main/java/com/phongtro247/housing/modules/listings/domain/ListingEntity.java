package com.phongtro247.housing.modules.listings.domain;

import com.phongtro247.housing.modules.locations.domain.LocationEntity;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
public class ListingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_type_id")
    private ListingTypeEntity listingType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private LocationEntity location;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal area;

    @Column(columnDefinition = "text")
    private String address;

    @Column(columnDefinition = "text")
    private String street;

    @Column(nullable = false, length = 30)
    private String status = "draft";

    @Column(name = "is_hot", nullable = false)
    private boolean hot;

    @Column(name = "hot_until")
    private Instant hotUntil;

    @Column(nullable = false)
    private long views;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String rules;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String amenities = "[]";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String surroundings = "[]";

    @Column(name = "room_count")
    private Integer roomCount;

    @Column(name = "has_video", nullable = false)
    private boolean hasVideo;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("mainImage DESC, id ASC")
    private List<ListingImageEntity> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ListingEntity() {
    }

    public ListingEntity(UserEntity owner, ListingTypeEntity listingType, LocationEntity location,
                         String name, BigDecimal price, BigDecimal area, String address, String street,
                         String description, String rules, Integer roomCount, String amenities,
                         String surroundings) {
        this.owner = owner;
        this.listingType = listingType;
        this.location = location;
        this.name = name;
        this.price = price;
        this.area = area;
        this.address = address;
        this.street = street;
        this.description = description;
        this.rules = rules;
        this.roomCount = roomCount;
        this.amenities = amenities == null || amenities.isBlank() ? "[]" : amenities;
        this.surroundings = surroundings == null || surroundings.isBlank() ? "[]" : surroundings;
        this.status = "pending";
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public UserEntity getOwner() { return owner; }
    public ListingTypeEntity getListingType() { return listingType; }
    public LocationEntity getLocation() { return location; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getArea() { return area; }
    public String getAddress() { return address; }
    public String getStreet() { return street; }
    public String getStatus() { return status; }
    public boolean isHot() { return hot; }
    public Instant getHotUntil() { return hotUntil; }
    public long getViews() { return views; }
    public void incrementViews() { views++; }
    public String getDescription() { return description; }
    public String getRules() { return rules; }
    public String getAmenities() { return amenities; }
    public String getSurroundings() { return surroundings; }
    public Integer getRoomCount() { return roomCount; }
    public boolean isHasVideo() { return hasVideo; }
    public String getVideoUrl() { return videoUrl; }
    public List<ListingImageEntity> getImages() { return images; }
    public Instant getCreatedAt() { return createdAt; }

    public void updateDetails(String name, BigDecimal price, BigDecimal area, String address, String street,
                              String description, String rules, Integer roomCount, String amenities,
                              String surroundings) {
        this.name = name;
        this.price = price;
        this.area = area;
        this.address = address;
        this.street = street;
        this.description = description;
        this.rules = rules;
        this.roomCount = roomCount;
        if (amenities != null) this.amenities = amenities;
        if (surroundings != null) this.surroundings = surroundings;
    }

    public void changeStatus(String status) { this.status = status; }
    public void setHot(boolean hot) { this.hot = hot; }
    public void setVideo(String videoUrl) {
        this.hasVideo = videoUrl != null && !videoUrl.isBlank();
        this.videoUrl = videoUrl;
    }
    public void setHotUntil(Instant hotUntil) {
        this.hotUntil = hotUntil;
        this.hot = hotUntil != null && hotUntil.isAfter(Instant.now());
    }
    public void addImage(String imageUrl, boolean mainImage) {
        images.add(new ListingImageEntity(this, imageUrl, mainImage));
    }
}
