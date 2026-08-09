package com.phongtro247.housing.modules.masterdata.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "master_codes",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_master_codes_category_code",
                columnNames = {"category_code", "code"}))
public class MasterCodeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_code", nullable = false, length = 50)
    private String categoryCode;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(nullable = false)
    private boolean status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected MasterCodeEntity() {
    }

    public MasterCodeEntity(String categoryCode, String code, String name, String description, boolean status) {
        this.categoryCode = categoryCode;
        this.code = code;
        this.name = name;
        this.description = description;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() { return id; }
    public String getCategoryCode() { return categoryCode; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void update(String code, String name, String description, boolean status) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStatus(boolean status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
}
