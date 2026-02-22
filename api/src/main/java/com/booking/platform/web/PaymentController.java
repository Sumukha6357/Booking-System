package com.booking.platform.web;

import com.booking.platform.dto.PaymentResponse;
import com.booking.platform.service.PaymentService;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/bookings/{bookingId}/initiate")
    public PaymentResponse initiate(@PathVariable UUID bookingId) {
        return paymentService.initiatePayment(bookingId);
    }

    @PostMapping("/bookings/{bookingId}/confirm")
    public PaymentResponse capture(@PathVariable UUID bookingId) {
        return paymentService.capturePayment(bookingId);
    }
}
