package com.phongtro247.housing.modules.landlordreports.application;

import com.phongtro247.housing.common.api.DataResponse;
import com.phongtro247.housing.common.message.MessageCatalog;
import com.phongtro247.housing.common.security.AuthenticatedUser;
import com.phongtro247.housing.modules.contracts.domain.ContractEntity;
import com.phongtro247.housing.modules.contracts.infrastructure.ContractRepository;
import com.phongtro247.housing.modules.landlordreports.api.dto.ExpenseItemResponse;
import com.phongtro247.housing.modules.landlordreports.api.dto.ExpenseListResponse;
import com.phongtro247.housing.modules.landlordreports.api.dto.ExpenseSummaryResponse;
import com.phongtro247.housing.modules.landlordreports.api.dto.LandlordReportResponse;
import com.phongtro247.housing.modules.listings.domain.ListingEntity;
import com.phongtro247.housing.modules.listings.infrastructure.ListingRepository;
import com.phongtro247.housing.modules.transactions.domain.TransactionEntity;
import com.phongtro247.housing.modules.transactions.infrastructure.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class LandlordReportService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final ListingRepository listingRepository;
    private final ContractRepository contractRepository;
    private final TransactionRepository transactionRepository;

    public LandlordReportService(ListingRepository listingRepository, ContractRepository contractRepository,
                                 TransactionRepository transactionRepository) {
        this.listingRepository = listingRepository;
        this.contractRepository = contractRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public DataResponse<LandlordReportResponse> report(AuthenticatedUser principal, Integer requestedDays) {
        int days = Math.min(Math.max(requestedDays == null ? 30 : requestedDays, 1), 3650);
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        List<ListingEntity> listings = listingRepository.findByOwner_Id(principal.id());
        List<ContractEntity> contracts = contractRepository.findByOwner_Id(principal.id());
        List<TransactionEntity> transactions = transactionRepository.findByUser_IdOrderByCreatedAtDesc(principal.id());

        long totalRooms = listings.stream().filter(item -> "published".equalsIgnoreCase(item.getStatus())).count();
        Set<Long> rentedListingIds = contracts.stream()
                .filter(contract -> MessageCatalog.CONTRACT_ACTIVE_STATUS.equals(contract.getStatus())
                        && !contract.getEndDate().isBefore(today))
                .map(contract -> contract.getListing().getId())
                .collect(java.util.stream.Collectors.toSet());
        Set<Long> tenantIds = contracts.stream()
                .filter(contract -> MessageCatalog.CONTRACT_ACTIVE_STATUS.equals(contract.getStatus())
                        && !contract.getEndDate().isBefore(today))
                .map(contract -> contract.getTenant().getId())
                .collect(java.util.stream.Collectors.toSet());
        long expiring = contracts.stream()
                .filter(contract -> !contract.getEndDate().isBefore(today)
                        && !contract.getEndDate().isAfter(today.plusDays(30))
                        && !MessageCatalog.CONTRACT_EXPIRED_STATUS.equals(contract.getStatus()))
                .count();
        Instant cutoff = Instant.now().minusSeconds(days * 24L * 60L * 60L);
        BigDecimal income = contracts.stream()
                .filter(contract -> !contract.getStartDate().isBefore(today.minusDays(days)))
                .map(ContractEntity::getRentPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal expense = transactions.stream()
                .filter(transaction -> "payment".equalsIgnoreCase(transaction.getType())
                        && !"failed".equalsIgnoreCase(transaction.getStatus())
                        && !transaction.getCreatedAt().isBefore(cutoff))
                .map(TransactionEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return DataResponse.of(new LandlordReportResponse(
                new LandlordReportResponse.Rooms(totalRooms, rentedListingIds.size(), Math.max(totalRooms - rentedListingIds.size(), 0)),
                new LandlordReportResponse.Tenants(tenantIds.size()),
                new LandlordReportResponse.Contracts(expiring),
                new LandlordReportResponse.Finance(income, expense, income.subtract(expense))));
    }

    @Transactional(readOnly = true)
    public ExpenseListResponse expenses(AuthenticatedUser principal, String type,
                                        LocalDate startDate, LocalDate endDate) {
        List<ExpenseItemResponse> items = new ArrayList<>();
        if (!"expense".equalsIgnoreCase(type)) {
            contractRepository.findByOwner_Id(principal.id()).stream()
                    .filter(contract -> startDate == null || !contract.getStartDate().isBefore(startDate))
                    .filter(contract -> endDate == null || !contract.getStartDate().isAfter(endDate))
                    .forEach(contract -> items.add(new ExpenseItemResponse(
                            contract.getId(), contract.getRentPrice(), contract.getStartDate().toString(),
                            MessageCatalog.EXPENSE_INCOME_LABEL, MessageCatalog.RENT_EXPENSE_CATEGORY,
                            contract.getListing().getName(), contract.getTenant().getName(),
                            contract.getCreatedAt().toString())));
        }
        if (!"income".equalsIgnoreCase(type)) {
            transactionRepository.findByUser_IdOrderByCreatedAtDesc(principal.id()).stream()
                    .filter(transaction -> "payment".equalsIgnoreCase(transaction.getType()))
                    .filter(transaction -> !"failed".equalsIgnoreCase(transaction.getStatus()))
                    .filter(transaction -> inDateRange(transaction.getCreatedAt(), startDate, endDate))
                    .forEach(transaction -> items.add(new ExpenseItemResponse(
                            transaction.getId(), transaction.getAmount(), transaction.getCreatedAt().toString(),
                            MessageCatalog.EXPENSE_OUTGOING_LABEL,
                            expenseCategory(transaction.getDescription()), transaction.getDescription(), "",
                            transaction.getCreatedAt().toString())));
        }
        items.sort(Comparator.comparing(ExpenseItemResponse::date).reversed());
        BigDecimal income = items.stream().filter(item -> MessageCatalog.EXPENSE_INCOME_LABEL.equals(item.type()))
                .map(ExpenseItemResponse::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal expense = items.stream().filter(item -> MessageCatalog.EXPENSE_OUTGOING_LABEL.equals(item.type()))
                .map(ExpenseItemResponse::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ExpenseListResponse(true, items,
                new ExpenseSummaryResponse(income, expense, income.subtract(expense)));
    }

    private boolean inDateRange(Instant value, LocalDate startDate, LocalDate endDate) {
        LocalDate date = value.atZone(BUSINESS_ZONE).toLocalDate();
        return (startDate == null || !date.isBefore(startDate)) && (endDate == null || !date.isAfter(endDate));
    }

    private String expenseCategory(String description) {
        String value = description == null ? "" : description.toLowerCase(Locale.ROOT);
        if (value.contains("phí đăng tin")) return MessageCatalog.POSTING_FEE_CATEGORY;
        if (value.contains("hot listing")) return MessageCatalog.HOT_LISTING_FEE_CATEGORY;
        return MessageCatalog.OTHER_EXPENSE_CATEGORY;
    }
}
