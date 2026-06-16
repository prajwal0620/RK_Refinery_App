package com.rkrefinery.dto.bill;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BillResponse {
    private Long id;
    private String billNo;
    private LocalDate billDate;

    private String customerName;
    private String customerMobile;

    private BigDecimal totalWeight;
    private BigDecimal totalPurity;
    private BigDecimal majuri;

    private List<BillItemResponse> items;
}