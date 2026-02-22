package com.booking.platform.dto;

public record IntegrationStatusResponse(
    String mode,
    String paymentProvider,
    String emailProvider,
    String smsProvider,
    boolean paymentConfigured,
    boolean emailConfigured,
    boolean smsConfigured
) {
}
