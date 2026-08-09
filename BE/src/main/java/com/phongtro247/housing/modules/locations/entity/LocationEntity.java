package com.phongtro247.housing.modules.locations.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "locations")
public class LocationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(name = "parent_id")
    private Long parentId;

    protected LocationEntity() {
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public Long getParentId() { return parentId; }
}
