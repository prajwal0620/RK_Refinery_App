package com.rkrefinery.controller;

import com.rkrefinery.dto.customer.*;
import com.rkrefinery.response.ApiResponse;
import com.rkrefinery.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ApiResponse<CustomerResponse> upsert(@Valid @RequestBody CustomerUpsertRequest request) {
        return ApiResponse.ok("Saved", customerService.upsert(request));
    }

    @GetMapping
    public ApiResponse<List<CustomerResponse>> search(@RequestParam(required = false) String q) {
        return ApiResponse.ok("OK", customerService.search(q));
    }
}