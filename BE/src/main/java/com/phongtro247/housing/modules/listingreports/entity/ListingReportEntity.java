package com.phongtro247.housing.modules.listingreports.entity;

import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "listing_reports")
public class ListingReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private ListingEntity listing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private UserEntity reporter;

    @Column(nullable = false, columnDefinition = "text")
    private String reason;

    @Column(nullable = false, length = 30)
    private String status = "pending";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ListingReportEntity() {
    }

    public ListingReportEntity(ListingEntity listing, UserEntity reporter, String reason) {
        this.listing = listing;
        this.reporter = reporter;
        this.reason = reason;
    }

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public ListingEntity getListing() { return listing; }
    public UserEntity getReporter() { return reporter; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void updateStatus(String status) { this.status = status; }
}
