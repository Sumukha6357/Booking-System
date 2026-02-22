package com.booking.platform.integration.mock;

import com.booking.platform.integration.PaymentProvider;
import com.booking.platform.integration.PaymentResult;
import com.booking.platform.integration.PaymentWebhookHandler;
import java.math.BigDecimal;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MockPaymentProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentProvider.class);
    private final PaymentWebhookHandler webhookHandler;

    public MockPaymentProvider(PaymentWebhookHandler webhookHandler) {
        this.webhookHandler = webhookHandler;
    }

    @Override
    public PaymentResult initiate(UUID tenantId, UUID bookingId, BigDecimal amount) {
        String providerPaymentId = "mock-init-" + UUID.randomUUID();
        String payload = "{\"tenant\":\"" + tenantId + "\",\"booking\":\"" + bookingId + "\",\"amount\":" + amount + "}";
        log.info("mock_payment_initiate payload={}", payload);
        return new PaymentResult(providerPaymentId, "INITIATED", payload);
    }

    @Override
    public PaymentResult capture(UUID tenantId, UUID bookingId, String providerPaymentId, BigDecimal amount) {
        boolean success = amount.signum() > 0;
        String status = success ? "SUCCESS" : "FAILED";
        String payload = "{\"tenant\":\"" + tenantId + "\",\"booking\":\"" + bookingId + "\",\"providerPaymentId\":\"" + providerPaymentId + "\",\"status\":\"" + status + "\"}";
        log.info("mock_payment_capture payload={}", payload);
        webhookHandler.onPaymentUpdate(bookingId, providerPaymentId, status, payload);
        return new PaymentResult(providerPaymentId, status, payload);
    }

    @Override
    public String providerName() {
        return "MockPaymentProvider";
    }

    @Override
    public boolean configured() {
        return true;
    }
}
