package com.phongtro247.housing.modules.contracts.entity;

import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import com.phongtro247.housing.modules.listings.entity.ListingTypeEntity;
import com.phongtro247.housing.modules.tenants.entity.TenantEntity;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.common.message.MessageCatalog;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "contracts")
public class ContractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private TenantEntity tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private ListingEntity listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_type_id")
    private ListingTypeEntity listingType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private UserEntity owner;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "deposit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal depositPrice = BigDecimal.ZERO;

    @Column(name = "rent_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal rentPrice = BigDecimal.ZERO;

    @Column(columnDefinition = "text")
    private String note;

    @Column(nullable = false, length = 50)
    private String status = MessageCatalog.CONTRACT_ACTIVE_STATUS;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ContractEntity() {
    }

    public ContractEntity(TenantEntity tenant, ListingEntity listing, ListingTypeEntity listingType,
                          UserEntity owner, LocalDate startDate, LocalDate endDate,
                          BigDecimal depositPrice, BigDecimal rentPrice, String note, String status) {
        this.tenant = tenant;
        this.listing = listing;
        this.listingType = listingType;
        this.owner = owner;
        this.startDate = startDate;
        this.endDate = endDate;
        this.depositPrice = depositPrice == null ? BigDecimal.ZERO : depositPrice;
        this.rentPrice = rentPrice == null ? BigDecimal.ZERO : rentPrice;
        this.note = note;
        this.status = status;
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
    public TenantEntity getTenant() { return tenant; }
    public ListingEntity getListing() { return listing; }
    public ListingTypeEntity getListingType() { return listingType; }
    public UserEntity getOwner() { return owner; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public BigDecimal getDepositPrice() { return depositPrice; }
    public BigDecimal getRentPrice() { return rentPrice; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void update(LocalDate startDate, LocalDate endDate, BigDecimal depositPrice,
                       BigDecimal rentPrice, String note, ListingEntity listing,
                       ListingTypeEntity listingType, String status) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.depositPrice = depositPrice == null ? BigDecimal.ZERO : depositPrice;
        this.rentPrice = rentPrice == null ? BigDecimal.ZERO : rentPrice;
        this.note = note;
        this.listing = listing;
        this.listingType = listingType;
        this.status = status;
    }
}
