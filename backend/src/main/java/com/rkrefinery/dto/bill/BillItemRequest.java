package com.rkrefinery.dto.bill;

import jakarta.validation.constraints.*;
import lombok.Getter; import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class BillItemRequest {
    @NotBlank private String description;

    @NotNull @DecimalMin("0.01")
    private BigDecimal weight;

    @NotNull @DecimalMin("0.00") @DecimalMax("100.00")
    private BigDecimal touch;
}