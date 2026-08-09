package com.phongtro247.housing.modules.transactions.entity;

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
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "external_id", length = 120)
    private String externalId;

    @Column(nullable = false, length = 30)
    private String status = "pending";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected TransactionEntity() {
    }

    public TransactionEntity(UserEntity user, String type, BigDecimal amount, String description) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.description = description;
    }

    public TransactionEntity(UserEntity user, String type, BigDecimal amount, String description, String externalId) {
        this(user, type, amount, description);
        this.externalId = externalId;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public String getDescription() { return description; }
    public UserEntity getUser() { return user; }
    public String getExternalId() { return externalId; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void markSuccessful(BigDecimal amount, String description) {
        this.amount = amount;
        this.description = description;
        this.status = "success";
    }

    public void markFailed(String description) {
        this.description = description;
        this.status = "failed";
    }
}
