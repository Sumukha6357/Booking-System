package com.booking.platform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record ConcurrencyTestRequest(
    @NotNull UUID listingId,
    @NotNull LocalDate checkIn,
    @NotNull LocalDate checkOut,
    @Min(2) @Max(50) int parallelism
) {
}
