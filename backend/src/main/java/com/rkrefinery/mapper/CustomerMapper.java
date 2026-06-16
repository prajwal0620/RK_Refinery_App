package com.rkrefinery.mapper;

import com.rkrefinery.dto.customer.CustomerResponse;
import com.rkrefinery.entity.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerResponse toResponse(Customer c);
}