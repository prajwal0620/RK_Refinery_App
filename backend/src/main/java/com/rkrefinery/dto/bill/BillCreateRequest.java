package com.rkrefinery.dto.bill;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter; import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter
public class BillCreateRequest {
    @NotBlank private String customerName;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile must be 10 digits")
    private String customerMobile;

    @NotNull private LocalDate date;

    @NotNull @DecimalMin("0.00")
    private BigDecimal rate;

    @NotEmpty @Valid
    private List<BillItemRequest> items;
}