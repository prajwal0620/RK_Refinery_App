package com.rkrefinery.repository;

import com.rkrefinery.dto.report.ItemDetailReportRow;
import com.rkrefinery.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BillItemRepository extends JpaRepository<BillItem, Long> {

    // ✅ Detailed rows
    @Query("""
    select new com.rkrefinery.dto.report.ItemDetailReportRow(
      b.billDate,
      b.billNo,
      bi.description,
      bi.weight,
      bi.touch,
      bi.purity
    )
    from BillItem bi
    join bi.bill b
    where b.billDate >= coalesce(:from, b.billDate)
      and b.billDate <= coalesce(:to, b.billDate)
    order by b.billDate asc, b.id asc, bi.id asc
  """)
    List<ItemDetailReportRow> itemDetails(@Param("from") LocalDate from,
                                          @Param("to") LocalDate to);

    // ✅ Totals for items (weight/purity/items count)
    @Query("""
    select coalesce(sum(bi.weight), 0),
           coalesce(sum(bi.purity), 0),
           count(bi)
    from BillItem bi
    join bi.bill b
    where b.billDate >= coalesce(:from, b.billDate)
      and b.billDate <= coalesce(:to, b.billDate)
  """)
    Object[] itemDetailsTotals(@Param("from") LocalDate from,
                               @Param("to") LocalDate to);
}