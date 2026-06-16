package com.rkrefinery.dto.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateUtil {
    private DateUtil() {}

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;      // yyyy-MM-dd
    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("dd-MM-yyyy"); // dd-MM-yyyy

    public static LocalDate parseNullable(String s) {
        if (s == null) return null;
        s = s.trim();
        if (s.isEmpty()) return null;

        // try ISO
        try { return LocalDate.parse(s, ISO); } catch (Exception ignored) {}
        // try dd-MM-yyyy
        try { return LocalDate.parse(s, DMY); } catch (Exception ignored) {}

        throw new IllegalArgumentException("Invalid date format: " + s + " (use yyyy-MM-dd)");
    }
}