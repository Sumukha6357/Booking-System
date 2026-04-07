package com.booking.platform.web;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.domain.Listing;
import com.booking.platform.dto.ListingSearchResponse;
import com.booking.platform.dto.PriceQuoteResponse;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.service.ListingService;
import com.booking.platform.service.PricingService;
import com.booking.platform.tenant.TenantContext;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;
    private final PricingService pricingService;
    private final BookingRepository bookingRepository;

    public ListingController(ListingService listingService, PricingService pricingService, BookingRepository bookingRepository) {
        this.listingService = listingService;
        this.pricingService = pricingService;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public Listing create(@Valid @RequestBody Listing listing) {
        return listingService.createListing(listing);
    }

    @GetMapping("/{listingId}")
    public Listing get(@PathVariable UUID listingId) {
        return listingService.getListing(listingId);
    }

    @GetMapping("/{listingId}/price-quote")
    public PriceQuoteResponse priceQuote(
        @PathVariable UUID listingId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
        @RequestParam(required = false) String coupon
    ) {
        Listing listing = listingService.getListing(listingId);
        UUID tenantId = TenantContext.getRequired();
        List<Booking> existing = bookingRepository.findOverlappingBookings(
            tenantId, listingId, checkIn, checkOut,
            List.of(BookingState.HELD, BookingState.CONFIRMED, BookingState.COMPLETED)
        );
        return pricingService.quotePriceDetailed(listing.getBasePrice(), checkIn, checkOut, existing, coupon);
    }

    @GetMapping("/search")
    public List<ListingSearchResponse> search(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") double lat,
        @RequestParam(defaultValue = "0") double lon,
        @RequestParam(defaultValue = "20000") double radiusKm,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(defaultValue = "1") int guests,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return listingService.search(q, lat, lon, radiusKm, minPrice, maxPrice, guests, checkIn, checkOut);
    }

    @PutMapping("/{listingId}")
    public Listing update(@PathVariable UUID listingId, @Valid @RequestBody Listing listing) {
        return listingService.updateListing(listingId, listing);
    }

    @GetMapping("/{listingId}/booked-dates")
    public List<java.util.Map<String, LocalDate>> getBookedDates(@PathVariable UUID listingId) {
        UUID tenantId = com.booking.platform.tenant.TenantContext.getRequired();
        return bookingRepository.findOverlappingBookings(
            tenantId, listingId, LocalDate.now(), LocalDate.now().plusYears(1),
            List.of(com.booking.platform.domain.BookingState.HELD, com.booking.platform.domain.BookingState.CONFIRMED, com.booking.platform.domain.BookingState.COMPLETED)
        ).stream()
        .map(b -> java.util.Map.of("from", b.getCheckIn(), "to", b.getCheckOut()))
        .toList();
    }

    @DeleteMapping("/{listingId}")
    public void delete(@PathVariable UUID listingId) {
        listingService.deleteListing(listingId);
    }
}
