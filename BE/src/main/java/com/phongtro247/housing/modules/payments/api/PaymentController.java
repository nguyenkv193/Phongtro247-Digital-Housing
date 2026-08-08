package com.phongtro247.housing.modules.payments.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.payments.api.dto.PaymentCreateRequest;
import com.phongtro247.housing.modules.payments.api.dto.PaymentCreateResponse;
import com.phongtro247.housing.modules.payments.application.MomoPaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/momo")
public class PaymentController {

    private final MomoPaymentService momoPaymentService;

    public PaymentController(MomoPaymentService momoPaymentService) {
        this.momoPaymentService = momoPaymentService;
    }

    @PostMapping("/create")
    public PaymentCreateResponse create(@AuthenticationPrincipal AuthenticatedUser principal,
                                        @Valid @RequestBody PaymentCreateRequest request) {
        return momoPaymentService.create(principal, request);
    }

    @PostMapping("/callback")
    public ResponseEntity<Void> callback(@RequestBody JsonNode callback) {
        momoPaymentService.callback(callback);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/check-status")
    public JsonNode checkStatus(@RequestBody Map<String, String> request) {
        return momoPaymentService.queryStatus(request.get("orderId"));
    }
}
