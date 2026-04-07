package com.booking.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ListingSearchResponse(
    UUID listingId,
    String title,
    String location,
    BigDecimal price,
    int maxGuests,
    String amenities,
    String imageUrls,
    LocalDate from,
    LocalDate to
) {
}
