package com.rkrefinery.service;

import com.rkrefinery.dto.report.ItemDetailReportResponse;
import com.rkrefinery.dto.report.ItemWiseReportRow;
import com.rkrefinery.dto.report.ReportSummaryResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    ReportSummaryResponse summary(LocalDate from, LocalDate to);
    List<ItemWiseReportRow> itemWise(LocalDate from, LocalDate to);

    // ✅ NEW
    ItemDetailReportResponse itemDetails(LocalDate from, LocalDate to);
}