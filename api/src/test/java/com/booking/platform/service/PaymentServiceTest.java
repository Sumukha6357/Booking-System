package com.booking.platform.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.domain.PaymentTransaction;
import com.booking.platform.dto.PaymentResponse;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.integration.PaymentProvider;
import com.booking.platform.integration.PaymentResult;
import com.booking.platform.repository.PaymentTransactionRepository;
import com.booking.platform.tenant.TenantContext;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class PaymentServiceTest {

    @Mock
    private PaymentTransactionRepository paymentRepository;

    @Mock
    private BookingService bookingService;

    @Mock
    private PaymentProvider paymentProvider;

    private PaymentService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PaymentService(paymentRepository, bookingService, paymentProvider);
        TenantContext.set(UUID.fromString("00000000-0000-0000-0000-000000000001"));
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void bookingAndPaymentHappyPath() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setState(BookingState.HELD);
        booking.setPrice(new BigDecimal("120.00"));

        PaymentTransaction tx = new PaymentTransaction();
        tx.setBookingId(bookingId);
        tx.setGatewayStatus("INITIATED");
        tx.setAmount(new BigDecimal("120.00"));
        tx.setProviderPaymentId("pid-1");

        when(bookingService.getTenantBooking(bookingId)).thenReturn(booking);
        when(paymentRepository.findByBookingId(bookingId)).thenReturn(Optional.of(tx));
        when(paymentProvider.capture(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq(bookingId), org.mockito.ArgumentMatchers.eq("pid-1"), org.mockito.ArgumentMatchers.eq(new BigDecimal("120.00"))))
            .thenReturn(new PaymentResult("pid-1", "SUCCESS", "{}"));
        when(paymentRepository.save(org.mockito.ArgumentMatchers.any(PaymentTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = service.capturePayment(bookingId);

        assertEquals("CAPTURED", response.status());
    }

    @Test
    void captureFailsWhenNotInitiated() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setPrice(new BigDecimal("120.00"));
        when(bookingService.getTenantBooking(bookingId)).thenReturn(booking);
        when(paymentRepository.findByBookingId(bookingId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.capturePayment(bookingId));
    }
}
