package com.rkrefinery.dto.report;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ItemDetailReportResponse {
    private LocalDate from;
    private LocalDate to;

    private long totalBills;
    private long totalItems;

    private BigDecimal totalWeight;
    private BigDecimal totalPurity;
    private BigDecimal totalMajuri;

    private List<ItemDetailReportRow> rows;
}