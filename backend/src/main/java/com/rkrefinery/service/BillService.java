package com.rkrefinery.service;

import com.rkrefinery.dto.bill.*;

import java.time.LocalDate;
import java.util.List;

public interface BillService {
    BillResponse create(BillCreateRequest request);
    BillResponse get(Long id);
    void delete(Long id);
    List<BillSearchResponse> search(LocalDate from, LocalDate to, String mobile, String name, String billNo);
    BillResponse duplicate(Long id);
}