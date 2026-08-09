package com.phongtro247.housing.modules.landlordreports.dto;

import java.util.List;

public record ExpenseListResponse(boolean success, List<ExpenseItemResponse> data,
                                  ExpenseSummaryResponse summary) {
}
