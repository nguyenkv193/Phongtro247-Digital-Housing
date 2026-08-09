package com.phongtro247.housing.modules.listings.repository;

import com.phongtro247.housing.modules.listings.entity.ListingEntity;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class ListingSpecifications {

    private ListingSpecifications() {
    }

    public static Specification<ListingEntity> published() {
        return (root, query, builder) -> builder.equal(root.get("status"), "published");
    }

    public static Specification<ListingEntity> typeSlug(String typeSlug) {
        return (root, query, builder) -> builder.equal(root.join("listingType").get("slug"), typeSlug);
    }

    public static Specification<ListingEntity> hot() {
        return (root, query, builder) -> builder.isTrue(root.get("hot"));
    }

    public static Specification<ListingEntity> minPrice(BigDecimal value) {
        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get("price"), value);
    }

    public static Specification<ListingEntity> maxPrice(BigDecimal value) {
        return (root, query, builder) -> builder.lessThanOrEqualTo(root.get("price"), value);
    }

    public static Specification<ListingEntity> minArea(BigDecimal value) {
        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get("area"), value);
    }

    public static Specification<ListingEntity> maxArea(BigDecimal value) {
        return (root, query, builder) -> builder.lessThanOrEqualTo(root.get("area"), value);
    }

    public static Specification<ListingEntity> location(Long locationId) {
        return (root, query, builder) -> builder.equal(root.join("location").get("id"), locationId);
    }

    public static Specification<ListingEntity> hasVideo() {
        return (root, query, builder) -> builder.isTrue(root.get("hasVideo"));
    }
}
