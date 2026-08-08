package com.phongtro247.housing.modules.transactions.application;

import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.transactions.api.dto.TransactionHistoryResponse;
import com.phongtro247.housing.modules.transactions.api.dto.TransactionResponse;
import com.phongtro247.housing.modules.transactions.domain.TransactionEntity;
import com.phongtro247.housing.modules.transactions.infrastructure.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class TransactionService {

    private static final int MAX_HISTORY_SIZE = 100;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy")
            .withLocale(Locale.forLanguageTag("vi-VN"));

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public TransactionHistoryResponse history(AuthenticatedUser principal, Integer requestedLimit) {
        int limit = requestedLimit == null ? MAX_HISTORY_SIZE : Math.min(Math.max(requestedLimit, 1), MAX_HISTORY_SIZE);
        List<TransactionResponse> transactions = transactionRepository
                .findByUser_IdOrderByCreatedAtDesc(principal.id(), PageRequest.of(0, limit))
                .stream().map(this::toResponse).toList();
        return new TransactionHistoryResponse(true, transactions);
    }

    private TransactionResponse toResponse(TransactionEntity transaction) {
        String description = transaction.getDescription() == null ? "" : transaction.getDescription();
        return new TransactionResponse(
                transaction.getId(),
                DATE_FORMAT.format(transaction.getCreatedAt().atZone(ZoneId.of("Asia/Ho_Chi_Minh"))),
                formatType(transaction.getType()),
                transaction.getAmount(),
                transaction.getDescription(),
                formatStatus(transaction, description),
                transaction.getCreatedAt());
    }

    private String formatType(String type) {
        return switch (type == null ? "" : type) {
            case "deposit" -> MessageCatalog.TRANSACTION_DEPOSIT_LABEL;
            case "payment" -> MessageCatalog.TRANSACTION_PAYMENT_LABEL;
            case "refund" -> MessageCatalog.TRANSACTION_REFUND_LABEL;
            default -> type;
        };
    }

    private String formatStatus(TransactionEntity transaction, String description) {
        if ("success".equalsIgnoreCase(transaction.getStatus())) return MessageCatalog.TRANSACTION_SUCCESS_STATUS;
        if ("failed".equalsIgnoreCase(transaction.getStatus())) return MessageCatalog.TRANSACTION_FAILED_STATUS;
        if ("pending".equalsIgnoreCase(transaction.getStatus()) && description.isBlank()) {
            return MessageCatalog.TRANSACTION_PROCESSING_STATUS;
        }
        String normalized = description.toLowerCase(Locale.ROOT);
        if (normalized.contains("thành công") || normalized.contains("success")) {
            return MessageCatalog.TRANSACTION_SUCCESS_STATUS;
        }
        if (normalized.contains("thất bại") || normalized.contains("failed")) {
            return MessageCatalog.TRANSACTION_FAILED_STATUS;
        }
        if (normalized.contains("pending") || normalized.contains("đang xử lý")) {
            return MessageCatalog.TRANSACTION_PROCESSING_STATUS;
        }
        return MessageCatalog.TRANSACTION_SUCCESS_STATUS;
    }
}
