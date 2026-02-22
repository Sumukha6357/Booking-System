package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.domain.Listing;
import com.booking.platform.dto.ListingSearchResponse;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.repository.ListingRepository;
import com.booking.platform.tenant.TenantContext;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final BookingRepository bookingRepository;

    public ListingService(ListingRepository listingRepository, BookingRepository bookingRepository) {
        this.listingRepository = listingRepository;
        this.bookingRepository = bookingRepository;
    }

    public Listing createListing(Listing listing) {
        listing.setTenantId(TenantContext.getRequired());
        return listingRepository.save(listing);
    }

    public Listing getListing(UUID listingId) {
        UUID tenantId = TenantContext.getRequired();
        return listingRepository.findByIdAndTenantId(listingId, tenantId)
            .orElseThrow(() -> new NotFoundException("Listing not found"));
    }

    public List<ListingSearchResponse> search(String locationQuery, double lat, double lon, double radiusKm, LocalDate checkIn, LocalDate checkOut) {
        UUID tenantId = TenantContext.getRequired();
        List<Listing> listings = listingRepository.findByTenantIdAndActiveTrue(tenantId).stream()
            .filter(l -> locationQuery == null || l.getLocation().toLowerCase().contains(locationQuery.toLowerCase()))
            .filter(l -> haversineKm(lat, lon, l.getLatitude(), l.getLongitude()) <= radiusKm)
            .toList();

        return listings.stream()
            .filter(listing -> bookingRepository.findOverlappingBookings(
                tenantId,
                listing.getId(),
                checkIn,
                checkOut,
                List.of(BookingState.HELD, BookingState.CONFIRMED, BookingState.COMPLETED)
            ).isEmpty())
            .map(listing -> new ListingSearchResponse(
                listing.getId(),
                listing.getTitle(),
                listing.getLocation(),
                listing.getBasePrice(),
                checkIn,
                checkOut
            ))
            .toList();
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double r = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }
}
