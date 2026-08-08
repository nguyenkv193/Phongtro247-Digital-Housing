package com.phongtro247.housing.modules.users.application;

import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.exception.NotFoundException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.users.api.dto.HostInfoRequest;
import com.phongtro247.housing.modules.users.api.dto.HostInfoStatusResponse;
import com.phongtro247.housing.modules.users.api.dto.UpdateUserRequest;
import com.phongtro247.housing.modules.users.api.dto.UserProfileResponse;
import com.phongtro247.housing.modules.users.domain.UserEntity;
import com.phongtro247.housing.modules.users.domain.UserRole;
import com.phongtro247.housing.modules.users.infrastructure.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserEntity getRequired(AuthenticatedUser principal) {
        return userRepository.findById(principal.id())
                .orElseThrow(() -> new NotFoundException("User", principal.id()));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse profile(AuthenticatedUser principal) {
        return toResponse(getRequired(principal));
    }

    @Transactional
    public void update(AuthenticatedUser principal, UpdateUserRequest request) {
        UserEntity user = getRequired(principal);
        if (request.fullName() != null) user.setFullName(request.fullName().trim());
        if (request.gender() != null) user.setGender(request.gender());
        if (request.birthday() != null) user.setBirthday(request.birthday());
        if (request.cccd() != null) user.setCccd(request.cccd());
        if (request.address() != null) user.setAddress(request.address());
        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(request.email())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_EMAIL_EXISTS);
            }
            user.setEmail(request.email().trim());
        }
        if (request.phone() != null && !request.phone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.phone())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_PHONE_EXISTS);
            }
            user.setPhone(request.phone().trim());
        }
    }

    @Transactional
    public void becomeLandlord(AuthenticatedUser principal) {
        UserEntity user = getRequired(principal);
        if (!UserRole.ADMIN.value().equals(user.getRole())) {
            user.setRole(UserRole.LANDLORD.value());
        }
    }

    @Transactional
    public UserProfileResponse submitHostInfo(AuthenticatedUser principal, HostInfoRequest request) {
        UserEntity user = getRequired(principal);
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone().trim());
        user.setEmail(StringUtils.hasText(request.email()) ? request.email().trim() : user.getEmail());
        user.setAddress(request.address());
        user.setCompletedHostInfo(true);
        if (UserRole.LANDLORD.value().equalsIgnoreCase(request.role())) {
            user.setRole(UserRole.LANDLORD.value());
        }
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public HostInfoStatusResponse hostInfoStatus(AuthenticatedUser principal) {
        UserEntity user = getRequired(principal);
        return new HostInfoStatusResponse(user.isCompletedHostInfo(), user.getRole());
    }

    private UserProfileResponse toResponse(UserEntity user) {
        return new UserProfileResponse(
                user.getId(), user.getFullName(), user.getGender(), user.getBirthday(), user.getCccd(),
                user.getPhone(), user.getEmail(), user.getAddress(), user.getAvatar(), user.getRole(),
                user.isCompletedHostInfo(), user.getBalance(), user.getCreatedAt());
    }
}
