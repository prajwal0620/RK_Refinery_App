package com.rkrefinery.dto.report;

import java.math.BigDecimal;

public record ItemWiseReportRow(
        String description,
        BigDecimal totalWeight,
        BigDecimal totalPurity,
        long itemCount
) {}