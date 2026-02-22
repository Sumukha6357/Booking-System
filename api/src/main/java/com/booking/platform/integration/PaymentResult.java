package com.booking.platform.integration;

public record PaymentResult(
    String providerPaymentId,
    String status,
    String rawPayload
) {
}
