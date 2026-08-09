package com.phongtro247.housing.modules.transactions.dto;

import java.util.List;

public record TransactionHistoryResponse(boolean success, List<TransactionResponse> transactions) {
}
