package com.rkrefinery.mapper;

import com.rkrefinery.dto.bill.*;
import com.rkrefinery.entity.Bill;
import com.rkrefinery.entity.BillItem;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BillMapper {

    @Mapping(target="customerName", source="customer.name")
    @Mapping(target="customerMobile", source="customer.mobile")
    BillResponse toResponse(Bill bill);

    List<BillItemResponse> toItemResponses(List<BillItem> items);

    @Mapping(target="customerName", source="customer.name")
    @Mapping(target="customerMobile", source="customer.mobile")
    BillSearchResponse toSearchResponse(Bill bill);
}