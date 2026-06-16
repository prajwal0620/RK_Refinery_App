package com.rkrefinery.serviceImpl;

import com.rkrefinery.dto.customer.*;
import com.rkrefinery.entity.Customer;
import com.rkrefinery.mapper.CustomerMapper;
import com.rkrefinery.repository.CustomerRepository;
import com.rkrefinery.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Transactional
    @Override
    public CustomerResponse upsert(CustomerUpsertRequest request) {
        Customer c = customerRepository.findByMobile(request.getMobile())
                .orElse(Customer.builder().mobile(request.getMobile()).createdAt(Instant.now()).build());

        c.setName(request.getName());
        c = customerRepository.save(c);

        return customerMapper.toResponse(c);
    }

    @Override
    public List<CustomerResponse> search(String q) {
        return customerRepository.search(q).stream().map(customerMapper::toResponse).toList();
    }
}