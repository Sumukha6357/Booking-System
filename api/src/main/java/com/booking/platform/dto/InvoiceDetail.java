package com.booking.platform.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceDetail(
    UUID invoiceId,
    UUID bookingId,
    String propertyTitle,
    LocalDate checkIn,
    LocalDate checkOut,
    BigDecimal subtotal,
    BigDecimal discount,
    BigDecimal total,
    String status,
    Instant capturedAt
) {}
