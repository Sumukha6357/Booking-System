package com.booking.platform.integration;

import java.util.UUID;

public interface PaymentWebhookHandler {
    void onPaymentUpdate(UUID bookingId, String providerPaymentId, String status, String payload);
}
