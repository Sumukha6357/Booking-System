package com.booking.platform.integration.real;

import com.booking.platform.integration.PaymentProvider;
import com.booking.platform.integration.PaymentResult;
import java.math.BigDecimal;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RealPaymentProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(RealPaymentProvider.class);
    private final String apiKey;

    public RealPaymentProvider(String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    public PaymentResult initiate(UUID tenantId, UUID bookingId, BigDecimal amount) {
        log.info("real_payment_initiate_stub tenant={} booking={} amount={}", tenantId, bookingId, amount);
        return new PaymentResult("real-init-stub-" + UUID.randomUUID(), "INITIATED", "{}");
    }

    @Override
    public PaymentResult capture(UUID tenantId, UUID bookingId, String providerPaymentId, BigDecimal amount) {
        log.info("real_payment_capture_stub tenant={} booking={} paymentId={} amount={}", tenantId, bookingId, providerPaymentId, amount);
        return new PaymentResult(providerPaymentId, "SUCCESS", "{}");
    }

    @Override
    public String providerName() {
        return "RealPaymentProviderStub";
    }

    @Override
    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
