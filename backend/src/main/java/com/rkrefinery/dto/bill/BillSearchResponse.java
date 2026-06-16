package com.rkrefinery.dto.bill;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BillSearchResponse {
    private Long id;
    private String billNo;
    private LocalDate billDate;
    private String customerName;
    private String customerMobile;
    private BigDecimal totalWeight;
    private BigDecimal totalPurity;
    private BigDecimal majuri;
}