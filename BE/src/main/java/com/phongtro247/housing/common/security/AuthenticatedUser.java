package com.phongtro247.housing.common.security;

public record AuthenticatedUser(Long id, String email, String role) {
}
