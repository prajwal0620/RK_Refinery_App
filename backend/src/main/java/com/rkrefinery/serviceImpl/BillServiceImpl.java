package com.rkrefinery.serviceImpl;

import com.rkrefinery.dto.bill.*;
import com.rkrefinery.entity.*;
import com.rkrefinery.exception.ResourceNotFoundException;
import com.rkrefinery.mapper.BillMapper;
import com.rkrefinery.repository.BillRepository;
import com.rkrefinery.repository.CustomerRepository;
import com.rkrefinery.service.BillService;
import com.rkrefinery.util.BillNoGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final BillMapper billMapper;

    @Transactional
    @Override
    public BillResponse create(BillCreateRequest request) {

        Customer customer = customerRepository.findByMobile(request.getCustomerMobile())
                .orElseGet(() -> Customer.builder()
                        .mobile(request.getCustomerMobile())
                        .createdAt(Instant.now())
                        .build());

        customer.setName(request.getCustomerName());
        if (customer.getCreatedAt() == null) customer.setCreatedAt(Instant.now());
        customer = customerRepository.save(customer);

        long seq = billRepository.nextBillSeq();
        String billNo = BillNoGenerator.format(seq);

        Bill bill = Bill.builder()
                .billNo(billNo)
                .customer(customer)
                .billDate(request.getDate())
                .totalWeight(BigDecimal.ZERO)
                .totalPurity(BigDecimal.ZERO)
                .majuri(BigDecimal.ZERO)
                .build();

        BigDecimal totalWeight = BigDecimal.ZERO;
        BigDecimal totalPurity = BigDecimal.ZERO;

        for (BillItemRequest it : request.getItems()) {
            BigDecimal purity = it.getWeight()
                    .multiply(it.getTouch())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            totalWeight = totalWeight.add(it.getWeight());
            totalPurity = totalPurity.add(purity);

            bill.getItems().add(BillItem.builder()
                    .bill(bill)
                    .description(it.getDescription())
                    .weight(it.getWeight().setScale(2, RoundingMode.HALF_UP))
                    .touch(it.getTouch().setScale(2, RoundingMode.HALF_UP))
                    .purity(purity)
                    .build());
        }

        BigDecimal rate = request.getRate() == null ? BigDecimal.ZERO : request.getRate();

// raw majuri (per gram rate)
        BigDecimal majuriRaw = totalWeight.multiply(rate).setScale(2, RoundingMode.HALF_UP);

// ✅ round UP to next 10
        BigDecimal ten = new BigDecimal("10");
        BigDecimal majuriRounded = majuriRaw
                .divide(ten, 0, RoundingMode.CEILING)
                .multiply(ten)
                .setScale(2, RoundingMode.HALF_UP);

        bill.setTotalWeight(totalWeight.setScale(2, RoundingMode.HALF_UP));
        bill.setTotalPurity(totalPurity.setScale(2, RoundingMode.HALF_UP));
        bill.setMajuri(majuriRounded);

        Bill saved = billRepository.save(bill);

        Bill detailed = billRepository.findDetailedById(saved.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found after save"));

        return billMapper.toResponse(detailed);
    }

    @Transactional(readOnly = true)
    @Override
    public BillResponse get(Long id) {
        Bill bill = billRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        return billMapper.toResponse(bill);
    }

    @Transactional
    @Override
    public void delete(Long id) {
        if (!billRepository.existsById(id)) throw new ResourceNotFoundException("Bill not found");
        billRepository.deleteById(id);
    }
    @Transactional(readOnly = true)
    @Override
    public List<BillSearchResponse> search(LocalDate from, LocalDate to, String mobile, String name, String billNo) {

        String m = (mobile == null) ? "" : mobile.trim();
        String n = (name == null) ? "" : name.trim();
        String b = (billNo == null) ? "" : billNo.trim();

        return billRepository.search(from, to, m, n, b)
                .stream().map(billMapper::toSearchResponse).toList();
    }

    @Transactional
    @Override
    public BillResponse duplicate(Long id) {
        Bill original = billRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        BillCreateRequest req = new BillCreateRequest();
        req.setCustomerName(original.getCustomer().getName());
        req.setCustomerMobile(original.getCustomer().getMobile());
        req.setDate(LocalDate.now());

        // rate derive (optional)
        BigDecimal rate = BigDecimal.ZERO;
        if (original.getTotalWeight() != null && original.getTotalWeight().compareTo(BigDecimal.ZERO) > 0) {
            rate = original.getMajuri().divide(original.getTotalWeight(), 2, RoundingMode.HALF_UP);
        }
        req.setRate(rate);

        req.setItems(original.getItems().stream().map(i -> {
            BillItemRequest r = new BillItemRequest();
            r.setDescription(i.getDescription());
            r.setWeight(i.getWeight());
            r.setTouch(i.getTouch());
            return r;
        }).toList());

        return create(req);
    }
}