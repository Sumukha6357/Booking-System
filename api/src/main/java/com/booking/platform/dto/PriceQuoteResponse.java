package com.booking.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PriceQuoteResponse(
    LocalDate checkIn,
    LocalDate checkOut,
    long nights,
    BigDecimal basePricePerNight,
    BigDecimal subtotal,
    boolean weekendSurcharge,
    boolean seasonalSurcharge,
    boolean demandSurcharge,
    BigDecimal multiplierTotal,
    BigDecimal finalPrice
) {}
