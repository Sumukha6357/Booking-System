package com.booking.platform.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record HoldBookingRequest(
    @NotNull UUID listingId,
    @NotNull @Future LocalDate checkIn,
    @NotNull @Future LocalDate checkOut
) {
}
