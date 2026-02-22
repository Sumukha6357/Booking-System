package com.booking.platform.web;

import com.booking.platform.domain.Listing;
import com.booking.platform.dto.ListingSearchResponse;
import com.booking.platform.service.ListingService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    public Listing create(@Valid @RequestBody Listing listing) {
        return listingService.createListing(listing);
    }

    @GetMapping("/{listingId}")
    public Listing get(@PathVariable UUID listingId) {
        return listingService.getListing(listingId);
    }

    @GetMapping("/search")
    public List<ListingSearchResponse> search(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") double lat,
        @RequestParam(defaultValue = "0") double lon,
        @RequestParam(defaultValue = "20000") double radiusKm,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return listingService.search(q, lat, lon, radiusKm, checkIn, checkOut);
    }
}
