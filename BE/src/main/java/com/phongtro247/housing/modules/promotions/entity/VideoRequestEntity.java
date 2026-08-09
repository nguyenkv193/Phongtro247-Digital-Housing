package com.phongtro247.housing.modules.promotions.entity;

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
@Table(name = "video_requests")
public class VideoRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private ListingEntity listing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(columnDefinition = "text")
    private String note;

    @Column(nullable = false, length = 30)
    private String status = "pending";

    @Column(name = "admin_note", columnDefinition = "text")
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private UserEntity processedBy;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected VideoRequestEntity() {
    }

    public VideoRequestEntity(ListingEntity listing, UserEntity user, String note) {
        this.listing = listing;
        this.user = user;
        this.note = note;
    }

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public ListingEntity getListing() { return listing; }
    public UserEntity getUser() { return user; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public String getAdminNote() { return adminNote; }
    public Instant getProcessedAt() { return processedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void approve(UserEntity admin, String adminNote) {
        this.status = "approved";
        this.adminNote = adminNote;
        this.processedBy = admin;
        this.processedAt = Instant.now();
    }

    public void reject(UserEntity admin, String adminNote) {
        this.status = "rejected";
        this.adminNote = adminNote;
        this.processedBy = admin;
        this.processedAt = Instant.now();
    }
}
