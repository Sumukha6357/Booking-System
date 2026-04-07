package com.booking.platform.dto;

import jakarta.validation.constraints.Min;
import java.time.LocalDate;

public record ModifyBookingRequest(
    LocalDate checkIn,
    LocalDate checkOut,
    @Min(1)
    Integer guestCount,
    String guestNotes,
    String specialRequests
) {}
