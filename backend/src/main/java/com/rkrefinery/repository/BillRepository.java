package com.rkrefinery.repository;

import com.rkrefinery.entity.Bill;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    // -------------------------
    // Bill No sequence
    // -------------------------
    @Query(value = "select nextval('bill_no_seq')", nativeQuery = true)
    Long nextBillSeq();

    // -------------------------
    // Single bill with customer + items
    // -------------------------
    @EntityGraph(attributePaths = {"customer", "items"})
    @Query("select b from Bill b where b.id = :id")
    Optional<Bill> findDetailedById(@Param("id") Long id);

    // -------------------------
    // View/Search bills list (customer required)
    // -------------------------
    @EntityGraph(attributePaths = {"customer"})
    @Query("""
  select b from Bill b
  join b.customer c
  where b.billDate >= coalesce(:from, b.billDate)
    and b.billDate <= coalesce(:to, b.billDate)
    and (:mobile = '' or c.mobile like concat('%', :mobile, '%'))
    and (:name = '' or lower(c.name) like concat('%', lower(:name), '%'))
    and (:billNo = '' or lower(b.billNo) like concat('%', lower(:billNo), '%'))
  order by b.billDate desc, b.id desc
""")
    List<Bill> search(@Param("from") LocalDate from,
                      @Param("to") LocalDate to,
                      @Param("mobile") String mobile,
                      @Param("name") String name,
                      @Param("billNo") String billNo);
    // -------------------------
    // Dashboard - daily
    // -------------------------
    @Query("select coalesce(sum(b.totalWeight),0) from Bill b where b.billDate = :date")
    BigDecimal sumWeightByDate(@Param("date") LocalDate date);

    @Query("select coalesce(sum(b.totalPurity),0) from Bill b where b.billDate = :date")
    BigDecimal sumPurityByDate(@Param("date") LocalDate date);

    @Query("select coalesce(sum(b.majuri),0) from Bill b where b.billDate = :date")
    BigDecimal sumMajuriByDate(@Param("date") LocalDate date);

    @Query("select count(b) from Bill b where b.billDate = :date")
    long countBillsByDate(@Param("date") LocalDate date);

    @Query("select count(distinct b.customer.id) from Bill b where b.billDate = :date")
    long countCustomersByDate(@Param("date") LocalDate date);

    // -------------------------
    // Dashboard - overall
    // -------------------------
    @Query("select coalesce(sum(b.totalWeight),0) from Bill b")
    BigDecimal sumAllWeight();

    @Query("select coalesce(sum(b.totalPurity),0) from Bill b")
    BigDecimal sumAllPurity();

    @Query("select coalesce(sum(b.majuri),0) from Bill b")
    BigDecimal sumAllMajuri();

    @Query("select count(b) from Bill b")
    long countAllBills();

    @Query("select count(distinct b.customer.id) from Bill b")
    long countAllCustomers();

    // -------------------------
    // Reports - range totals
    // returns: [totalWeight, totalPurity, totalMajuri, totalBills]
    // -------------------------
    @Query("""
  select coalesce(sum(b.totalWeight),0),
         coalesce(sum(b.totalPurity),0),
         coalesce(sum(b.majuri),0),
         count(b)
  from Bill b
  where b.billDate >= coalesce(:from, b.billDate)
    and b.billDate <= coalesce(:to, b.billDate)
""")
    Object[] rangeTotals(@Param("from") LocalDate from, @Param("to") LocalDate to);
}