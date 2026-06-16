package com.rkrefinery.util;

public class BillNoGenerator {
    private BillNoGenerator() {}
    public static String format(long seq) {
        return "BILL-" + String.format("%04d", seq);
    }
}