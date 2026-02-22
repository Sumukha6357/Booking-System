package com.booking.platform.service;

import com.booking.platform.integration.PaymentWebhookHandler;
import com.booking.platform.repository.PaymentTransactionRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentWebhookService implements PaymentWebhookHandler {

    private static final Logger log = LoggerFactory.getLogger(PaymentWebhookService.class);

    private final PaymentTransactionRepository paymentRepository;

    public PaymentWebhookService(PaymentTransactionRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public void onPaymentUpdate(UUID bookingId, String providerPaymentId, String status, String payload) {
        paymentRepository.findByBookingId(bookingId).ifPresent(tx -> {
            tx.setProviderPaymentId(providerPaymentId);
            if ("SUCCESS".equals(status) && tx.getCapturedAt() == null) {
                tx.setGatewayStatus("WEBHOOK_SUCCESS");
            } else if (!"SUCCESS".equals(status)) {
                tx.setGatewayStatus("WEBHOOK_FAILED");
            }
            paymentRepository.save(tx);
            log.info("payment_webhook bookingId={} status={} payload={}", bookingId, status, payload);
        });
    }
}
