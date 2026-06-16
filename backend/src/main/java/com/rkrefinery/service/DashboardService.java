package com.rkrefinery.service;

import com.rkrefinery.dto.dashboard.DashboardSummaryResponse;

import java.time.LocalDate;

public interface DashboardService {
    DashboardSummaryResponse summary(LocalDate date);
}