package com.rkrefinery.controller;

import com.rkrefinery.dto.report.ItemWiseReportRow;
import com.rkrefinery.dto.report.ReportSummaryResponse;
import com.rkrefinery.dto.util.DateUtil;
import com.rkrefinery.response.ApiResponse;
import com.rkrefinery.service.ReportService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ApiResponse<ReportSummaryResponse> summary(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to
    ) {
        LocalDate f = DateUtil.parseNullable(from);
        LocalDate t = DateUtil.parseNullable(to);
        return ApiResponse.ok("OK", reportService.summary(f, t));
    }

    @GetMapping("/items")
    public ApiResponse<List<ItemWiseReportRow>> itemWise(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to
    ) {
        LocalDate f = DateUtil.parseNullable(from);
        LocalDate t = DateUtil.parseNullable(to);
        return ApiResponse.ok("OK", reportService.itemWise(f, t));
    }
    @GetMapping("/items-details")
    public ApiResponse<com.rkrefinery.dto.report.ItemDetailReportResponse> itemDetails(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to
    ) {
        var f = com.rkrefinery.dto.util.DateUtil.parseNullable(from);
        var t = com.rkrefinery.dto.util.DateUtil.parseNullable(to);
        return ApiResponse.ok("OK", reportService.itemDetails(f, t));
    }
}