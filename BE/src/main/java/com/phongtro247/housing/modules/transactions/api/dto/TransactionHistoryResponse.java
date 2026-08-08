package com.phongtro247.housing.modules.transactions.api.dto;

import java.util.List;

public record TransactionHistoryResponse(boolean success, List<TransactionResponse> transactions) {
}
