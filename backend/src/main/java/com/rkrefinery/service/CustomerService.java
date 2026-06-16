package com.rkrefinery.service;

import com.rkrefinery.dto.customer.*;

import java.util.List;

public interface CustomerService {
    CustomerResponse upsert(CustomerUpsertRequest request);
    List<CustomerResponse> search(String q);
}