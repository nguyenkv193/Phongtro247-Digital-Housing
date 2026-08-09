package com.phongtro247.housing.modules.landlordreports.dto;

import java.math.BigDecimal;

public record ExpenseSummaryResponse(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal profit) {
}
