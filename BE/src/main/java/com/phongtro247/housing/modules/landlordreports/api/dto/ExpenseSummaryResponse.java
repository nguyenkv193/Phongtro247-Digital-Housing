package com.phongtro247.housing.modules.landlordreports.api.dto;

import java.math.BigDecimal;

public record ExpenseSummaryResponse(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal profit) {
}
