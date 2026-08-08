package com.phongtro247.housing.modules.users.api;

import com.phongtro247.housing.common.api.MessageResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.modules.users.api.dto.BalanceResponse;
import com.phongtro247.housing.modules.users.api.dto.HostInfoRequest;
import com.phongtro247.housing.modules.users.api.dto.HostInfoStatusResponse;
import com.phongtro247.housing.modules.users.api.dto.UpdateUserRequest;
import com.phongtro247.housing.modules.users.api.dto.UserProfileResponse;
import com.phongtro247.housing.modules.users.application.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/info")
    public UserProfileResponse info(@AuthenticationPrincipal AuthenticatedUser principal) {
        return userService.profile(principal);
    }

    @PutMapping("/update")
    public MessageResponse update(@AuthenticationPrincipal AuthenticatedUser principal,
                                  @RequestBody UpdateUserRequest request) {
        userService.update(principal, request);
        return MessageResponse.success(MessageCatalog.SUC_USER_UPDATED);
    }

    @PostMapping("/become-landlord")
    public MessageResponse becomeLandlord(@AuthenticationPrincipal AuthenticatedUser principal) {
        userService.becomeLandlord(principal);
        return MessageResponse.success(MessageCatalog.SUC_BECOME_LANDLORD);
    }

    @PostMapping("/submit-host-info")
    public UserProfileResponse submitHostInfo(@AuthenticationPrincipal AuthenticatedUser principal,
                                              @Valid @RequestBody HostInfoRequest request) {
        return userService.submitHostInfo(principal, request);
    }

    @GetMapping("/host-info-status")
    public HostInfoStatusResponse hostInfoStatus(@AuthenticationPrincipal AuthenticatedUser principal) {
        return userService.hostInfoStatus(principal);
    }

    @GetMapping("/balance")
    public BalanceResponse balance(@AuthenticationPrincipal AuthenticatedUser principal) {
        return new BalanceResponse(userService.getRequired(principal).getBalance());
    }
}
