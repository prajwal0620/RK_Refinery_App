package com.rkrefinery.controller;

import com.rkrefinery.dto.bill.*;
import com.rkrefinery.response.ApiResponse;
import com.rkrefinery.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import com.rkrefinery.dto.util.DateUtil;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping
    public ApiResponse<BillResponse> create(@Valid @RequestBody BillCreateRequest request) {
        return ApiResponse.ok("Bill created", billService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<BillResponse> get(@PathVariable Long id) {
        return ApiResponse.ok("OK", billService.get(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        billService.delete(id);
        return ApiResponse.ok("Deleted", null);
    }

    @PostMapping("/{id}/duplicate")
    public ApiResponse<BillResponse> duplicate(@PathVariable Long id) {
        return ApiResponse.ok("Duplicated", billService.duplicate(id));
    }

    @GetMapping
    public ApiResponse<List<BillSearchResponse>> search(
            @RequestParam(required = false, defaultValue = "") String from,
            @RequestParam(required = false, defaultValue = "") String to,
            @RequestParam(defaultValue = "") String mobile,
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "") String billNo
    ) {
        LocalDate f = com.rkrefinery.dto.util.DateUtil.parseNullable(from);
        LocalDate t = com.rkrefinery.dto.util.DateUtil.parseNullable(to);
        return ApiResponse.ok("OK", billService.search(f, t, mobile, name, billNo));
    }
}