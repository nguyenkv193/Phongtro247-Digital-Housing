package com.phongtro247.housing.modules.payments.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phongtro247.housing.common.api.ActionResponse;
import com.phongtro247.housing.common.exception.ApiException;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.payments.dto.PaymentCreateRequest;
import com.phongtro247.housing.modules.payments.dto.PaymentCreateResponse;
import com.phongtro247.housing.infrastructure.momo.MomoPaymentClient;
import com.phongtro247.housing.modules.transactions.entity.TransactionEntity;
import com.phongtro247.housing.modules.transactions.repository.TransactionRepository;
import com.phongtro247.housing.modules.users.entity.UserEntity;
import com.phongtro247.housing.modules.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class MomoPaymentService {

    private final MomoPaymentClient momoClient;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final ObjectMapper objectMapper;
    private final String accessKey;
    private final String secretKey;
    private final String partnerCode;
    private final String redirectUrl;
    private final String ipnUrl;

    public MomoPaymentService(MomoPaymentClient momoClient, UserRepository userRepository,
                              TransactionRepository transactionRepository, ObjectMapper objectMapper,
                              @Value("${app.payment.momo.access-key}") String accessKey,
                              @Value("${app.payment.momo.secret-key}") String secretKey,
                              @Value("${app.payment.momo.partner-code}") String partnerCode,
                              @Value("${app.payment.momo.redirect-url}") String redirectUrl,
                              @Value("${app.payment.momo.ipn-url}") String ipnUrl) {
        this.momoClient = momoClient;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.objectMapper = objectMapper;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.partnerCode = partnerCode;
        this.redirectUrl = redirectUrl;
        this.ipnUrl = ipnUrl;
    }

    @Transactional
    public PaymentCreateResponse create(AuthenticatedUser principal, PaymentCreateRequest request) {
        requireConfigured();
        UserEntity user = userRepository.findById(principal.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, MessageCatalog.ERR_USER_NOT_FOUND));
        String orderId = partnerCode + System.currentTimeMillis();
        String orderInfo = request.orderInfo() == null || request.orderInfo().isBlank()
                ? MessageCatalog.DEFAULT_DEPOSIT_ORDER_INFO : request.orderInfo();
        String extraData = encodeExtraData(user.getId());
        String requestType = "payWithMethod";
        String rawSignature = "accessKey=" + accessKey + "&amount=" + money(request.amount())
                + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl
                + "&requestId=" + orderId + "&requestType=" + requestType;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", partnerCode);
        payload.put("partnerName", "PhongTro247");
        payload.put("storeId", "PhongTro247Store");
        payload.put("requestId", orderId);
        payload.put("amount", request.amount().longValueExact());
        payload.put("orderId", orderId);
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", redirectUrl);
        payload.put("ipnUrl", ipnUrl);
        payload.put("lang", "vi");
        payload.put("requestType", requestType);
        payload.put("autoCapture", true);
        payload.put("extraData", extraData);
        payload.put("orderGroupId", "");
        payload.put("signature", hmac(rawSignature));

        JsonNode response = momoClient.createOrder(payload);
        if (response == null || response.path("resultCode").asInt(-1) != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_MOMO_ORDER_FAILED);
        }
        transactionRepository.save(new TransactionEntity(user, "deposit", request.amount(),
                MessageCatalog.format(MessageCatalog.MOMO_TRANSACTION_DESCRIPTION, orderId), orderId));
        return new PaymentCreateResponse(true, MessageCatalog.SUC_PAYMENT_ORDER_CREATED.code(),
                text(response, "payUrl"), orderId, text(response, "deeplink"),
                text(response, "qrCodeUrl"), MessageCatalog.SUC_PAYMENT_ORDER_CREATED.message());
    }

    @Transactional
    public ActionResponse callback(JsonNode callback) {
        requireConfigured();
        if (!isValidCallbackSignature(callback)) {
            return ActionResponse.failure(MessageCatalog.ERR_INVALID_SIGNATURE);
        }
        String orderId = callback.path("orderId").asText();
        long userId = decodeUserId(callback.path("extraData").asText());
        BigDecimal amount = callback.path("amount").decimalValue();
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, MessageCatalog.ERR_USER_NOT_FOUND));
        TransactionEntity transaction = transactionRepository.findByExternalId(orderId)
                .orElseGet(() -> new TransactionEntity(user, "deposit", amount,
                        MessageCatalog.format(MessageCatalog.MOMO_TRANSACTION_DESCRIPTION, orderId), orderId));
        if ("success".equalsIgnoreCase(transaction.getStatus())) {
            return ActionResponse.warning(MessageCatalog.WAR_PAYMENT_ALREADY_PROCESSED);
        }
        int resultCode = callback.path("resultCode").asInt(-1);
        if (resultCode == 0) {
            user.setBalance(user.getBalance().add(amount));
            transaction.markSuccessful(amount, MessageCatalog.format(
                    MessageCatalog.MOMO_SUCCESS_TRANSACTION_DESCRIPTION, orderId,
                    callback.path("transId").asText()));
        } else {
            transaction.markFailed(MessageCatalog.format(MessageCatalog.MOMO_FAILED_TRANSACTION_DESCRIPTION, orderId));
        }
        transactionRepository.save(transaction);
        return resultCode == 0
                ? ActionResponse.success(MessageCatalog.SUC_PAYMENT_PROCESSED)
                : ActionResponse.failure(MessageCatalog.ERR_PAYMENT_FAILED);
    }

    public JsonNode queryStatus(String orderId) {
        requireConfigured();
        String rawSignature = "accessKey=" + accessKey + "&orderId=" + orderId
                + "&partnerCode=" + partnerCode + "&requestId=" + orderId;
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", partnerCode);
        payload.put("requestId", orderId);
        payload.put("orderId", orderId);
        payload.put("signature", hmac(rawSignature));
        payload.put("lang", "vi");
        return momoClient.queryOrder(payload);
    }

    private boolean isValidCallbackSignature(JsonNode callback) {
        String rawSignature = "accessKey=" + accessKey + "&amount=" + callback.path("amount").asText()
                + "&extraData=" + callback.path("extraData").asText() + "&message=" + callback.path("message").asText()
                + "&orderId=" + callback.path("orderId").asText() + "&orderInfo=" + callback.path("orderInfo").asText()
                + "&orderType=" + callback.path("orderType").asText("momo_wallet") + "&partnerCode="
                + callback.path("partnerCode").asText() + "&payType=" + callback.path("payType").asText("qr")
                + "&requestId=" + callback.path("requestId").asText() + "&responseTime="
                + callback.path("responseTime").asText() + "&resultCode=" + callback.path("resultCode").asText()
                + "&transId=" + callback.path("transId").asText();
        String provided = callback.path("signature").asText("");
        return MessageDigest.isEqual(hmac(rawSignature).getBytes(StandardCharsets.UTF_8),
                provided.getBytes(StandardCharsets.UTF_8));
    }

    private String encodeExtraData(Long userId) {
        try {
            return Base64.getEncoder().encodeToString(objectMapper.writeValueAsBytes(Map.of("userId", userId)));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(MessageCatalog.ERR_PAYMENT_METADATA_ENCODING.message(), exception);
        }
    }

    private long decodeUserId(String extraData) {
        try {
            return objectMapper.readTree(Base64.getDecoder().decode(extraData)).path("userId").asLong(0);
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, MessageCatalog.ERR_INVALID_PAYMENT_METADATA);
        }
    }

    private String hmac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte item : digest) result.append(String.format("%02x", item));
            return result.toString();
        } catch (Exception exception) {
            throw new IllegalStateException(MessageCatalog.ERR_PAYMENT_SIGNING_FAILED.message(), exception);
        }
    }

    private void requireConfigured() {
        if (accessKey == null || accessKey.isBlank() || secretKey == null || secretKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, MessageCatalog.ERR_MOMO_NOT_CONFIGURED);
        }
    }

    private String text(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }

    private String money(BigDecimal value) {
        return value.stripTrailingZeros().toPlainString();
    }
}
