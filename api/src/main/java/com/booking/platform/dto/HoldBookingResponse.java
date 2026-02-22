package com.booking.platform.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record HoldBookingResponse(
    UUID bookingId,
    Instant holdExpiresAt,
    BigDecimal quotedPrice,
    String state
) {
}
