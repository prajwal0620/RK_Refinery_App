package com.rkrefinery.serviceImpl;

import com.rkrefinery.dto.report.ItemWiseReportRow;
import com.rkrefinery.dto.report.ReportSummaryResponse;
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

        // Some JPA providers return nested array: [ Object[] ]
        if (row != null && row.length == 1 && row[0] instanceof Object[]) {
            row = (Object[]) row[0];
        }

        BigDecimal totalWeight = toBigDecimal(row != null && row.length > 0 ? row[0] : null);
        BigDecimal totalPurity = toBigDecimal(row != null && row.length > 1 ? row[1] : null);
        BigDecimal totalMajuri = toBigDecimal(row != null && row.length > 2 ? row[2] : null);
        long totalBills = toLong(row != null && row.length > 3 ? row[3] : null);

        return ReportSummaryResponse.builder()
                .from(from)
                .to(to)
                .totalBills(totalBills)
                .totalWeight(totalWeight)
                .totalPurity(totalPurity)
                .totalMajuri(totalMajuri)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public List<ItemWiseReportRow> itemWise(LocalDate from, LocalDate to) {
        return billItemRepository.itemWise(from, to);
    }

    private BigDecimal toBigDecimal(Object v) {
        if (v == null) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        if (v instanceof BigDecimal bd) {
            return bd.setScale(2, RoundingMode.HALF_UP);
        }
        if (v instanceof Number n) {
            // Avoid ClassCast issues when DB returns Long/Integer/Double
            return BigDecimal.valueOf(n.doubleValue()).setScale(2, RoundingMode.HALF_UP);
        }
        return new BigDecimal(v.toString()).setScale(2, RoundingMode.HALF_UP);
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number n) return n.longValue();
        return Long.parseLong(v.toString());
    }
}