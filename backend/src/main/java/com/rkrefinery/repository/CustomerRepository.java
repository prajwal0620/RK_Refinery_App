package com.rkrefinery.repository;

import com.rkrefinery.entity.Customer;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByMobile(String mobile);

    @Query("""
    select c from Customer c
    where (:q is null or lower(c.name) like concat('%', lower(:q), '%')
       or c.mobile like concat('%', :q, '%'))
    order by c.id desc
  """)
    List<Customer> search(@Param("q") String q);
}