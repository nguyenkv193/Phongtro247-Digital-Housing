package com.phongtro247.housing.modules.landlordreports.controller;

import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.landlordreports.dto.ExpenseListResponse;
import com.phongtro247.housing.modules.landlordreports.dto.LandlordReportResponse;
import com.phongtro247.housing.modules.landlordreports.service.LandlordReportService;
import com.phongtro247.housing.common.api.DataResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
public class LandlordReportController {

    private final LandlordReportService reportService;

    public LandlordReportController(LandlordReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/api/reports")
    public DataResponse<LandlordReportResponse> report(@AuthenticationPrincipal AuthenticatedUser principal,
                                                       @RequestParam(required = false) Integer days) {
        return reportService.report(principal, days);
    }

    @GetMapping("/api/expenses")
    public ExpenseListResponse expenses(@AuthenticationPrincipal AuthenticatedUser principal,
                                        @RequestParam(required = false) String type,
                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.expenses(principal, type, startDate, endDate);
    }
}
