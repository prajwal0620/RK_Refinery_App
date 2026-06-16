package com.rkrefinery.dto.report;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReportSummaryResponse {
    private LocalDate from;
    private LocalDate to;
    private long totalBills;
    private BigDecimal totalWeight;
    private BigDecimal totalPurity;
    private BigDecimal totalMajuri;
}