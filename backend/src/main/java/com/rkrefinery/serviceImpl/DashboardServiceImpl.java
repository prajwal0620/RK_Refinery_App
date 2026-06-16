package com.rkrefinery.serviceImpl;

import com.rkrefinery.dto.dashboard.DashboardSummaryResponse;
import com.rkrefinery.repository.BillRepository;
import com.rkrefinery.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final BillRepository billRepository;

    @Override
    public DashboardSummaryResponse summary(LocalDate date) {
        var daily = DashboardSummaryResponse.Daily.builder()
                .totalBills(billRepository.countBillsByDate(date))
                .totalWeight(billRepository.sumWeightByDate(date))
                .totalPurity(billRepository.sumPurityByDate(date))
                .totalMajuri(billRepository.sumMajuriByDate(date))
                .customerCount(billRepository.countCustomersByDate(date))
                .build();

        var overall = DashboardSummaryResponse.Overall.builder()
                .totalBills(billRepository.countAllBills())
                .totalWeight(billRepository.sumAllWeight())
                .totalPurity(billRepository.sumAllPurity())
                .totalMajuri(billRepository.sumAllMajuri())
                .customerCount(billRepository.countAllCustomers())
                .build();

        return DashboardSummaryResponse.builder()
                .daily(daily)
                .overall(overall)
                .build();
    }
}