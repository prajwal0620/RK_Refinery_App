package com.rkrefinery.serviceImpl;

import com.rkrefinery.dto.report.*;
import com.rkrefinery.repository.BillItemRepository;
import com.rkrefinery.repository.BillRepository;
import com.rkrefinery.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;

    @Transactional(readOnly = true)
    @Override
    public ReportSummaryResponse summary(LocalDate from, LocalDate to) {
        Object[] row = billRepository.rangeTotals(from, to);
        if (row != null && row.length == 1 && row[0] instanceof Object[]) row = (Object[]) row[0];

        return ReportSummaryResponse.builder()
                .from(from).to(to)
                .totalBills(toLong(row, 3))
                .totalWeight(toBigDecimal(row, 0))
                .totalPurity(toBigDecimal(row, 1))
                .totalMajuri(toBigDecimal(row, 2))
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public List<ItemWiseReportRow> itemWise(LocalDate from, LocalDate to) {
        // keep if you still want grouped report
        return List.of();
    }

    // ✅ NEW: item-detail report
    @Transactional(readOnly = true)
    @Override
    public ItemDetailReportResponse itemDetails(LocalDate from, LocalDate to) {

        List<ItemDetailReportRow> rows = billItemRepository.itemDetails(from, to);

        Object[] itemTotals = billItemRepository.itemDetailsTotals(from, to);
        if (itemTotals != null && itemTotals.length == 1 && itemTotals[0] instanceof Object[]) itemTotals = (Object[]) itemTotals[0];

        Object[] billTotals = billRepository.rangeTotals(from, to);
        if (billTotals != null && billTotals.length == 1 && billTotals[0] instanceof Object[]) billTotals = (Object[]) billTotals[0];

        BigDecimal totalWeight = toBigDecimal(itemTotals, 0);
        BigDecimal totalPurity = toBigDecimal(itemTotals, 1);
        long totalItems = toLong(itemTotals, 2);

        BigDecimal totalMajuri = toBigDecimal(billTotals, 2);
        long totalBills = toLong(billTotals, 3);

        return ItemDetailReportResponse.builder()
                .from(from)
                .to(to)
                .totalBills(totalBills)
                .totalItems(totalItems)
                .totalWeight(totalWeight)
                .totalPurity(totalPurity)
                .totalMajuri(totalMajuri)
                .rows(rows)
                .build();
    }

    private BigDecimal toBigDecimal(Object[] row, int idx) {
        if (row == null || row.length <= idx || row[idx] == null) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        Object v = row[idx];
        if (v instanceof BigDecimal bd) return bd.setScale(2, RoundingMode.HALF_UP);
        if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue()).setScale(2, RoundingMode.HALF_UP);
        return new BigDecimal(v.toString()).setScale(2, RoundingMode.HALF_UP);
    }

    private long toLong(Object[] row, int idx) {
        if (row == null || row.length <= idx || row[idx] == null) return 0L;
        Object v = row[idx];
        if (v instanceof Number n) return n.longValue();
        return Long.parseLong(v.toString());
    }
}