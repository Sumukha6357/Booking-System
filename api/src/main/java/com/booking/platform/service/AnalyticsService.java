package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.dto.AnalyticsResponse;
import com.booking.platform.dto.RevenueExport;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.repository.ListingRepository;
import com.booking.platform.tenant.TenantContext;
import com.booking.platform.domain.Listing;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;

    public AnalyticsService(BookingRepository bookingRepository, ListingRepository listingRepository) {
        this.bookingRepository = bookingRepository;
        this.listingRepository = listingRepository;
    }

    public List<RevenueExport> getRevenueExport() {
        UUID tenantId = TenantContext.getRequired();
        List<Booking> bookings = bookingRepository.findByTenantId(tenantId);
        List<Listing> listings = listingRepository.findByTenantId(tenantId);
        
        return bookings.stream()
            .filter(b -> b.getState() == BookingState.CONFIRMED || b.getState() == BookingState.COMPLETED)
            .map(b -> {
                String title = listings.stream()
                    .filter(l -> l.getId().equals(b.getListingId()))
                    .map(Listing::getTitle)
                    .findFirst()
                    .orElse("Unknown Property");
                return new RevenueExport(b.getId(), title, b.getCheckIn(), b.getCheckOut(), b.getPrice(), b.getState().name());
            })
            .toList();
    }

    public AnalyticsResponse getTenantMetrics() {
        List<Booking> bookings = bookingRepository.findByTenantId(TenantContext.getRequired());
        if (bookings.isEmpty()) {
            return new AnalyticsResponse(0.0, 0.0, BigDecimal.ZERO, BigDecimal.ZERO, 0.0);
        }

        long confirmed = bookings.stream().filter(b -> b.getState() == BookingState.CONFIRMED || b.getState() == BookingState.COMPLETED).count();
        long cancelled = bookings.stream().filter(b -> b.getState() == BookingState.CANCELLED).count();
        long held = bookings.stream().filter(b -> b.getState() == BookingState.HELD).count();

        BigDecimal totalRevenue = bookings.stream()
            .filter(b -> b.getState() == BookingState.CONFIRMED || b.getState() == BookingState.COMPLETED)
            .map(Booking::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgValue = confirmed == 0 ? BigDecimal.ZERO : totalRevenue.divide(BigDecimal.valueOf(confirmed), 2, RoundingMode.HALF_UP);

        double occupancyRate = percentage(confirmed, bookings.size());
        double conversionRate = percentage(confirmed, confirmed + cancelled + held);
        double cancellationRate = percentage(cancelled, bookings.size());

        return new AnalyticsResponse(occupancyRate, conversionRate, avgValue, totalRevenue, cancellationRate);
    }

    private double percentage(long value, long total) {
        if (total == 0) {
            return 0.0;
        }
        return (value * 100.0) / total;
    }
}
