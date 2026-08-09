package com.phongtro247.housing.modules.tenants.entity;

import com.phongtro247.housing.modules.locations.entity.LocationEntity;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tenants")
public class TenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private UserEntity owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false, length = 150)
    private String name;

    private LocalDate birthday;

    @Column(length = 30)
    private String gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id")
    private LocationEntity ward;

    @Column(columnDefinition = "text")
    private String address;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(length = 150)
    private String occupation;

    @Column(length = 30)
    private String cccd;

    @Column(name = "stay_status", nullable = false, length = 50)
    private String stayStatus = "Chưa đăng ký";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TenantEntity() {
    }

    public TenantEntity(UserEntity owner, String name, String phone) {
        this.owner = owner;
        this.name = name;
        this.phone = phone;
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
    public UserEntity getUser() { return user; }
    public String getName() { return name; }
    public LocalDate getBirthday() { return birthday; }
    public String getGender() { return gender; }
    public LocationEntity getWard() { return ward; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getOccupation() { return occupation; }
    public String getCccd() { return cccd; }
    public String getStayStatus() { return stayStatus; }
    public Instant getCreatedAt() { return createdAt; }

    public void updateDetails(String name, LocalDate birthday, String gender, LocationEntity ward,
                              String address, String phone, String email, String occupation,
                              String cccd, String stayStatus) {
        this.name = name;
        this.birthday = birthday;
        this.gender = gender;
        this.ward = ward;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.occupation = occupation;
        this.cccd = cccd;
        this.stayStatus = stayStatus;
    }

    public void updateStayStatus(String stayStatus) {
        this.stayStatus = stayStatus;
    }

    public void linkUser(UserEntity user) {
        this.user = user;
    }
}
