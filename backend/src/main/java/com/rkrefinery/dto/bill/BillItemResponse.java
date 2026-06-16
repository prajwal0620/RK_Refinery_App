package com.rkrefinery.dto.bill;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BillItemResponse {
    private Long id;
    private String description;
    private BigDecimal weight;
    private BigDecimal touch;
    private BigDecimal purity;
}