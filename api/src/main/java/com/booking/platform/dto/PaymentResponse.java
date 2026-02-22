package com.booking.platform.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(
    UUID paymentId,
    BigDecimal amount,
    String status
) {
}
