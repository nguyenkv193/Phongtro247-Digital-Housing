package com.phongtro247.housing.modules.transactions.controller;

import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.transactions.dto.TransactionHistoryResponse;
import com.phongtro247.housing.modules.transactions.service.TransactionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/history")
    public TransactionHistoryResponse history(@AuthenticationPrincipal AuthenticatedUser principal,
                                              @RequestParam(required = false) Integer limit) {
        return transactionService.history(principal, limit);
    }
}
