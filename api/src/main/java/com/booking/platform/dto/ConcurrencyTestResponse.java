package com.booking.platform.dto;

public record ConcurrencyTestResponse(
    int bookingSuccessCount,
    int paymentSuccessCount,
    int totalAttempts,
    boolean singleBookingGuaranteed,
    boolean singleCaptureGuaranteed
) {
}
