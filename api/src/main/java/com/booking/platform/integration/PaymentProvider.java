package com.booking.platform.integration;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentProvider {
    PaymentResult initiate(UUID tenantId, UUID bookingId, BigDecimal amount);

    PaymentResult capture(UUID tenantId, UUID bookingId, String providerPaymentId, BigDecimal amount);

    String providerName();

    boolean configured();
}
