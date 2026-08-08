package com.phongtro247.housing.modules.listings.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;

import java.time.Instant;

@Entity
@Table(name = "listing_images")
public class ListingImageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private ListingEntity listing;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "is_main", nullable = false)
    private boolean mainImage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ListingImageEntity() {
    }

    public ListingImageEntity(ListingEntity listing, String imageUrl, boolean mainImage) {
        this.listing = listing;
        this.imageUrl = imageUrl;
        this.mainImage = mainImage;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public String getImageUrl() { return imageUrl; }
    public boolean isMainImage() { return mainImage; }
}
