package com.rkrefinery.dto.dashboard;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardSummaryResponse {
    private Daily daily;
    private Overall overall;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Daily {
        private long totalBills;
        private BigDecimal totalWeight;
        private BigDecimal totalPurity;
        private BigDecimal totalMajuri;
        private long customerCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Overall {
        private long totalBills;
        private BigDecimal totalWeight;
        private BigDecimal totalPurity;
        private BigDecimal totalMajuri;
        private long customerCount;
    }
}