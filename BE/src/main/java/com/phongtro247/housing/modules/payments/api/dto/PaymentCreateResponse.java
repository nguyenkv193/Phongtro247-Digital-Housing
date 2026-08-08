package com.phongtro247.housing.modules.payments.api.dto;

public record PaymentCreateResponse(
        boolean success,
        String code,
        String payUrl,
        String orderId,
        String deeplink,
        String qrCodeUrl,
        String message
) {
}
