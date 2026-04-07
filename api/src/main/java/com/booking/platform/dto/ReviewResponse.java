package com.booking.platform.dto;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
    UUID id,
    UUID listingId,
    int rating,
    String comment,
    String guestName,
    Instant createdAt,
    String hostResponse,
    Instant hostResponseAt
) {}
