package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.PaymentTransaction;
import com.booking.platform.dto.PaymentResponse;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.integration.PaymentProvider;
import com.booking.platform.integration.PaymentResult;
import com.booking.platform.repository.PaymentTransactionRepository;
import com.booking.platform.tenant.TenantContext;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PaymentTransactionRepository paymentRepository;
    private final BookingService bookingService;
    private final PaymentProvider paymentProvider;

    public PaymentService(
        PaymentTransactionRepository paymentRepository,
        BookingService bookingService,
        PaymentProvider paymentProvider
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingService = bookingService;
        this.paymentProvider = paymentProvider;
    }

    @Transactional
    public PaymentResponse initiatePayment(UUID bookingId) {
        UUID tenantId = TenantContext.getRequired();
        Booking booking = bookingService.getTenantBooking(bookingId);

        PaymentTransaction existing = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (existing != null && "CAPTURED".equals(existing.getGatewayStatus())) {
            return new PaymentResponse(existing.getId(), existing.getAmount(), existing.getGatewayStatus());
        }

        PaymentResult providerResult = paymentProvider.initiate(tenantId, bookingId, booking.getPrice());
        PaymentTransaction tx = existing == null ? new PaymentTransaction() : existing;
        tx.setTenantId(tenantId);
        tx.setBookingId(bookingId);
        tx.setAmount(booking.getPrice());
        tx.setProviderPaymentId(providerResult.providerPaymentId());
        tx.setGatewayStatus("INITIATED");
        tx.setInitiatedAt(Instant.now());

        PaymentTransaction saved = paymentRepository.save(tx);
        return new PaymentResponse(saved.getId(), saved.getAmount(), saved.getGatewayStatus());
    }

    @Transactional
    public PaymentResponse capturePayment(UUID bookingId) {
        UUID tenantId = TenantContext.getRequired();
        Booking booking = bookingService.getTenantBooking(bookingId);
        PaymentTransaction tx = paymentRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new NotFoundException("Payment not initiated"));

        if ("CAPTURED".equals(tx.getGatewayStatus())) {
            return new PaymentResponse(tx.getId(), tx.getAmount(), tx.getGatewayStatus());
        }

        PaymentResult providerResult = paymentProvider.capture(
            tenantId,
            bookingId,
            tx.getProviderPaymentId(),
            tx.getAmount()
        );

        if (!"SUCCESS".equals(providerResult.status())) {
            tx.setGatewayStatus("FAILED");
            paymentRepository.save(tx);
            throw new ConflictException("Payment failed");
        }

        bookingService.confirm(bookingId);
        tx.setGatewayStatus("CAPTURED");
        tx.setCapturedAt(Instant.now());

        PaymentTransaction saved = paymentRepository.save(tx);
        return new PaymentResponse(saved.getId(), saved.getAmount(), saved.getGatewayStatus());
    }

}
