package com.rkrefinery.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ItemDetailReportRow(
        LocalDate billDate,
        String billNo,
        String description,
        BigDecimal weight,
        BigDecimal touch,
        BigDecimal purity
) {}