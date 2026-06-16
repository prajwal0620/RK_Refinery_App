package com.rkrefinery.repository;

import com.rkrefinery.dto.report.ItemWiseReportRow;
import com.rkrefinery.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BillItemRepository extends JpaRepository<BillItem, Long> {

    @Query("""
    select new com.rkrefinery.dto.report.ItemWiseReportRow(
      bi.description,
      coalesce(sum(bi.weight), 0),
      coalesce(sum(bi.purity), 0),
      count(bi)
    )
    from BillItem bi
    join bi.bill b
    where b.billDate >= coalesce(:from, b.billDate)
      and b.billDate <= coalesce(:to, b.billDate)
    group by bi.description
    order by bi.description asc
  """)
    List<ItemWiseReportRow> itemWise(@Param("from") LocalDate from,
                                     @Param("to") LocalDate to);
}