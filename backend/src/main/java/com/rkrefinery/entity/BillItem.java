package com.rkrefinery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name="bill_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BillItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false)
    private BigDecimal weight;

    @Column(nullable = false)
    private BigDecimal touch;

    @Column(nullable = false)
    private BigDecimal purity;
}