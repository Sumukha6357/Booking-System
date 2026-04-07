package com.booking.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RevenueExport(
    UUID bookingId,
    String propertyTitle,
    LocalDate checkIn,
    LocalDate checkOut,
    BigDecimal amount,
    String status
) {}
