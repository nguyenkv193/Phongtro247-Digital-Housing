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

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "hot_listing_requests")
public class HotListingRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private ListingEntity listing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal fee;

    @Column(nullable = false, length = 30)
    private String status = "pending";

    @Column(columnDefinition = "text")
    private String note;

    @Column(name = "admin_note", columnDefinition = "text")
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private UserEntity processedBy;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "hot_until")
    private Instant hotUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected HotListingRequestEntity() {
    }

    public HotListingRequestEntity(ListingEntity listing, UserEntity user, int durationDays,
                                   BigDecimal fee, String note) {
        this.listing = listing;
        this.user = user;
        this.durationDays = durationDays;
        this.fee = fee;
        this.note = note;
    }

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public ListingEntity getListing() { return listing; }
    public UserEntity getUser() { return user; }
    public int getDurationDays() { return durationDays; }
    public BigDecimal getFee() { return fee; }
    public String getStatus() { return status; }
    public String getNote() { return note; }
    public String getAdminNote() { return adminNote; }
    public Instant getProcessedAt() { return processedAt; }
    public Instant getHotUntil() { return hotUntil; }
    public Instant getCreatedAt() { return createdAt; }

    public void approve(UserEntity admin, String adminNote, Instant hotUntil) {
        this.status = "approved";
        this.adminNote = adminNote;
        this.processedBy = admin;
        this.processedAt = Instant.now();
        this.hotUntil = hotUntil;
    }

    public void reject(UserEntity admin, String adminNote) {
        this.status = "rejected";
        this.adminNote = adminNote;
        this.processedBy = admin;
        this.processedAt = Instant.now();
    }
}
