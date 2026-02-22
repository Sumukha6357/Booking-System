package com.booking.platform.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmBookingRequest(
    @NotBlank String idempotencyKey
) {
}
