package com.phongtro247.housing.modules.users.entity;

public enum UserRole {
    USER("user"),
    LANDLORD("landlord"),
    ADMIN("admin");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static UserRole from(String value) {
        for (UserRole role : values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        return USER;
    }
}
