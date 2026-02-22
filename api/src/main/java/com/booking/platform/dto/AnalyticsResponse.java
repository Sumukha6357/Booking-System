package com.booking.platform.dto;

import java.math.BigDecimal;

public record AnalyticsResponse(
    double occupancyRate,
    double bookingConversionRate,
    BigDecimal averageBookingValue,
    double cancellationRate
) {
}
