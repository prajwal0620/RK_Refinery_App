package com.rkrefinery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name="bills")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Bill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="bill_no", nullable = false, unique = true)
    private String billNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="customer_id", nullable = false)
    private Customer customer;

    @Column(name="bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name="total_weight", nullable = false)
    private BigDecimal totalWeight;

    @Column(name="total_purity", nullable = false)
    private BigDecimal totalPurity;

    @Column(name="majuri", nullable = false)
    private BigDecimal majuri;

    @OneToMany(mappedBy="bill", cascade=CascadeType.ALL, orphanRemoval=true)
    @Builder.Default
    private List<BillItem> items = new ArrayList<>();
}