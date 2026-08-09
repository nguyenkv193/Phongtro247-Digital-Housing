package com.phongtro247.housing.modules.revenues.entity;

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
@Table(name = "revenues")
public class RevenueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private ListingEntity listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "is_hot", nullable = false)
    private boolean hot;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected RevenueEntity() { }

    public RevenueEntity(ListingEntity listing, UserEntity user, BigDecimal amount, boolean hot) {
        this.listing = listing;
        this.user = user;
        this.amount = amount;
        this.hot = hot;
    }

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public ListingEntity getListing() { return listing; }
    public UserEntity getUser() { return user; }
    public BigDecimal getAmount() { return amount; }
    public boolean isHot() { return hot; }
    public Instant getCreatedAt() { return createdAt; }
}
